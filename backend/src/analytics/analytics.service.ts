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
    };
  }

  /** Get a global dashboard summary */
  async getDashboardStats() {
    const [totalCases, activeCases, completedCases, totalTasks, pendingTasks] = await Promise.all([
      this.prisma.case.count(),
      this.prisma.case.count({ where: { status: 'IN_PROGRESS' } }),
      this.prisma.case.count({ where: { status: 'COMPLETED' } }),
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
      cancelledCases: totalCases - activeCases - completedCases,
      totalTasks,
      pendingTasks,
      tasksPerDepartment: Array.from(deptMap.values()).sort((a, b) => b.count - a.count),
    };
  }
}
