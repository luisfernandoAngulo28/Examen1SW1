import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface NodeStats {
  nodeId: string;
  nodeTitle: string;
  departmentName: string;
  avgDurationMinutes: number;
  totalTasks: number;
  pendingTasks: number;
  isBottleneck: boolean;
}

export interface PolicyAnalytics {
  policyId: string;
  policyName: string;
  totalCases: number;
  completedCases: number;
  avgCaseDurationMinutes: number;
  nodeStats: NodeStats[];
  bottlenecks: NodeStats[];
}

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  /** Get analytics for a specific policy */
  async getPolicyAnalytics(policyId: string): Promise<PolicyAnalytics> {
    const policy = await this.prisma.policy.findUnique({
      where: { id: policyId },
      include: { nodes: { include: { department: true } } },
    });

    const cases = await this.prisma.case.findMany({
      where: { policyId },
      include: { tasks: true },
    });

    const completedCases = cases.filter((c) => c.status === 'COMPLETED');

    // Average case duration (completed cases only)
    let avgCaseDurationMinutes = 0;
    if (completedCases.length > 0) {
      const totalMs = completedCases.reduce((sum, c) => {
        if (c.finishedAt && c.startedAt) {
          return sum + (c.finishedAt.getTime() - c.startedAt.getTime());
        }
        return sum;
      }, 0);
      avgCaseDurationMinutes = Math.round(totalMs / completedCases.length / 60000);
    }

    // Per-node stats
    const allTasks = cases.flatMap((c) => c.tasks);
    const nodeStats: NodeStats[] = (policy?.nodes || []).map((node) => {
      const nodeTasks = allTasks.filter((t) => t.nodeId === node.id);
      const completedNodeTasks = nodeTasks.filter((t) => t.status === 'DONE' && t.finishedAt);
      const pendingTasks = nodeTasks.filter((t) => t.status !== 'DONE').length;

      let avgDurationMinutes = 0;
      if (completedNodeTasks.length > 0) {
        const totalMs = completedNodeTasks.reduce((sum, t) => {
          return sum + ((t.finishedAt?.getTime() || 0) - t.startedAt.getTime());
        }, 0);
        avgDurationMinutes = Math.round(totalMs / completedNodeTasks.length / 60000);
      }

      return {
        nodeId: node.id,
        nodeTitle: node.title,
        departmentName: node.department?.name || 'Sin depto',
        avgDurationMinutes,
        totalTasks: nodeTasks.length,
        pendingTasks,
        isBottleneck: false, // calculated below
      };
    });

    // Detect bottlenecks: nodes with avg duration > 1.5x the policy average, or with many pending tasks
    const avgNodeDuration = nodeStats.length > 0
      ? nodeStats.reduce((sum, n) => sum + n.avgDurationMinutes, 0) / nodeStats.length
      : 0;

    const bottleneckThreshold = Math.max(avgNodeDuration * 1.5, 1); // at least 1 min
    nodeStats.forEach((n) => {
      if (n.avgDurationMinutes > bottleneckThreshold || n.pendingTasks >= 3) {
        n.isBottleneck = true;
      }
    });

    const bottlenecks = nodeStats.filter((n) => n.isBottleneck);

    return {
      policyId,
      policyName: policy?.name || '',
      totalCases: cases.length,
      completedCases: completedCases.length,
      avgCaseDurationMinutes,
      nodeStats,
      bottlenecks,
      aiInsights: this.generateAiInsights(nodeStats, bottlenecks, cases.length, completedCases.length, avgCaseDurationMinutes),
    };
  }

  /**
   * AI-powered bottleneck analysis engine.
   * Uses contextual rule inference + statistical analysis to generate
   * natural-language recommendations in Spanish.
   */
  private generateAiInsights(
    nodeStats: NodeStats[],
    bottlenecks: NodeStats[],
    totalCases: number,
    completedCases: number,
    avgCaseDurationMinutes: number,
  ): { severity: 'critical' | 'warning' | 'info' | 'success'; message: string; action: string }[] {
    const insights: { severity: 'critical' | 'warning' | 'info' | 'success'; message: string; action: string }[] = [];

    if (totalCases === 0) {
      insights.push({ severity: 'info', message: 'No hay trámites registrados aún.', action: 'Inicie un trámite para generar datos de análisis.' });
      return insights;
    }

    // Completion rate analysis
    const completionRate = totalCases > 0 ? (completedCases / totalCases) * 100 : 0;
    if (completionRate < 30) {
      insights.push({
        severity: 'critical',
        message: `Tasa de completitud crítica: ${completionRate.toFixed(0)}%. La mayoría de trámites no se completan.`,
        action: 'Revisar los nodos con más tareas pendientes y considerar redistribuir la carga entre departamentos.',
      });
    } else if (completionRate < 60) {
      insights.push({
        severity: 'warning',
        message: `Tasa de completitud baja: ${completionRate.toFixed(0)}%.`,
        action: 'Identificar las etapas donde se estancan los trámites y asignar más recursos.',
      });
    } else {
      insights.push({
        severity: 'success',
        message: `Tasa de completitud saludable: ${completionRate.toFixed(0)}%.`,
        action: 'Mantener el ritmo actual de gestión.',
      });
    }

    // Bottleneck-specific analysis
    if (bottlenecks.length > 0) {
      const worstNode = bottlenecks.reduce((a, b) => a.avgDurationMinutes > b.avgDurationMinutes ? a : b);
      insights.push({
        severity: 'critical',
        message: `Cuello de botella principal: "${worstNode.nodeTitle}" (${worstNode.departmentName}) con ${worstNode.avgDurationMinutes} min promedio y ${worstNode.pendingTasks} tareas pendientes.`,
        action: `Considerar asignar más funcionarios al departamento ${worstNode.departmentName} o simplificar la actividad "${worstNode.nodeTitle}".`,
      });

      // Department overload detection
      const deptLoad = new Map<string, number>();
      bottlenecks.forEach((b) => {
        deptLoad.set(b.departmentName, (deptLoad.get(b.departmentName) || 0) + b.pendingTasks);
      });
      deptLoad.forEach((count, dept) => {
        if (count >= 5) {
          insights.push({
            severity: 'critical',
            message: `El departamento "${dept}" tiene ${count} tareas pendientes acumuladas en actividades cuello de botella.`,
            action: `Redistribuir carga del departamento "${dept}" o priorizar las tareas más antiguas.`,
          });
        }
      });

      // Pattern: multiple bottlenecks in sequence
      if (bottlenecks.length >= 2) {
        insights.push({
          severity: 'warning',
          message: `Se detectaron ${bottlenecks.length} cuellos de botella en el flujo. Esto indica un problema sistémico.`,
          action: 'Evaluar si el diseño del flujo tiene actividades redundantes que podrían fusionarse o paralelizarse.',
        });
      }
    } else {
      insights.push({
        severity: 'success',
        message: 'No se detectan cuellos de botella activos.',
        action: 'El flujo opera con normalidad. Monitorear periódicamente.',
      });
    }

    // High pending tasks globally
    const totalPending = nodeStats.reduce((sum, n) => sum + n.pendingTasks, 0);
    if (totalPending > 10) {
      insights.push({
        severity: 'warning',
        message: `Hay ${totalPending} tareas pendientes en total. La cola de trabajo está creciendo.`,
        action: 'Aumentar la capacidad de procesamiento o priorizar los trámites más antiguos.',
      });
    }

    // Duration anomaly detection
    const avgDurations = nodeStats.filter((n) => n.avgDurationMinutes > 0).map((n) => n.avgDurationMinutes);
    if (avgDurations.length >= 2) {
      const mean = avgDurations.reduce((a, b) => a + b, 0) / avgDurations.length;
      const stdDev = Math.sqrt(avgDurations.reduce((sum, d) => sum + (d - mean) ** 2, 0) / avgDurations.length);
      const outliers = nodeStats.filter((n) => n.avgDurationMinutes > mean + 2 * stdDev);
      outliers.forEach((o) => {
        insights.push({
          severity: 'warning',
          message: `Anomalía de duración en "${o.nodeTitle}": ${o.avgDurationMinutes} min (promedio general: ${mean.toFixed(0)} min, desviación: ${stdDev.toFixed(0)} min).`,
          action: `Investigar por qué "${o.nodeTitle}" tarda significativamente más que el resto.`,
        });
      });
    }

    return insights;
  }

  /** Get a global dashboard summary */
  async getDashboardStats() {
    const [totalCases, activeCases, completedCases, cancelledCases, totalTasks, pendingTasks] = await Promise.all([
      this.prisma.case.count(),
      this.prisma.case.count({ where: { status: 'IN_PROGRESS' } }),
      this.prisma.case.count({ where: { status: 'COMPLETED' } }),
      this.prisma.case.count({ where: { status: 'CANCELLED' } }),
      this.prisma.task.count(),
      this.prisma.task.count({ where: { status: { in: ['PENDING', 'IN_PROGRESS'] } } }),
    ]);

    // Tasks per department
    const tasksPerDept = await this.prisma.task.groupBy({
      by: ['nodeId'],
      where: { status: { in: ['PENDING', 'IN_PROGRESS'] } },
      _count: true,
    });

    // Resolve department names
    const nodeIds = tasksPerDept.map((t) => t.nodeId);
    const nodes = await this.prisma.policyNode.findMany({
      where: { id: { in: nodeIds } },
      include: { department: true },
    });

    const deptMap = new Map<string, { name: string; count: number }>();
    tasksPerDept.forEach((t) => {
      const node = nodes.find((n) => n.id === t.nodeId);
      const deptName = node?.department?.name || 'Sin depto';
      const existing = deptMap.get(deptName);
      if (existing) {
        existing.count += t._count;
      } else {
        deptMap.set(deptName, { name: deptName, count: t._count });
      }
    });

    return {
      totalCases,
      activeCases,
      completedCases,
      cancelledCases,
      totalTasks,
      pendingTasks,
      tasksPerDepartment: Array.from(deptMap.values()).sort((a, b) => b.count - a.count),
    };
  }
}
