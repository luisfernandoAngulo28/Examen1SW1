import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EventsGateway } from '../events/events.gateway';

@Injectable()
export class CasesService {
  constructor(
    private prisma: PrismaService,
    private events: EventsGateway,
  ) {}

  /** List all cases, optionally filtered by policyId */
  findAll(policyId?: string) {
    return this.prisma.case.findMany({
      where: policyId ? { policyId } : undefined,
      include: {
        policy: { select: { id: true, name: true } },
        tasks: { include: { node: true, assignedUser: { select: { id: true, name: true, email: true } } } },
      },
      orderBy: { startedAt: 'desc' },
    });
  }

  /** Get a single case with full details */
  async findOne(id: string) {
    const c = await this.prisma.case.findUnique({
      where: { id },
      include: {
        policy: { select: { id: true, name: true } },
        tasks: {
          include: {
            node: { include: { department: true } },
            assignedUser: { select: { id: true, name: true, email: true } },
            formSubmission: true,
          },
          orderBy: { startedAt: 'asc' },
        },
        eventLogs: { orderBy: { createdAt: 'asc' } },
      },
    });
    if (!c) throw new NotFoundException('Caso no encontrado');
    return c;
  }

  /**
   * Start a new case from a policy.
   * Finds the start node (node with no incoming edges) and creates the first task.
   */
  async startCase(policyId: string) {
    // Verify policy exists and is active
    const policy = await this.prisma.policy.findUnique({
      where: { id: policyId },
      include: {
        nodes: true,
        edges: true,
      },
    });
    if (!policy) throw new NotFoundException('Política no encontrada');
    if (policy.status !== 'ACTIVE') throw new BadRequestException('La política no está activa');
    if (policy.nodes.length === 0) throw new BadRequestException('La política no tiene nodos');

    // Find start node(s): nodes with no incoming edges
    const nodesWithIncoming = new Set(policy.edges.map((e) => e.toNodeId));
    const startNodes = policy.nodes.filter((n) => !nodesWithIncoming.has(n.id));
    if (startNodes.length === 0) throw new BadRequestException('No se encontró nodo de inicio');

    // Create the case
    const newCase = await this.prisma.case.create({
      data: {
        policyId,
        currentNodeId: startNodes[0].id,
        status: 'IN_PROGRESS',
      },
    });

    // Create tasks for each start node (supports PARALLEL start)
    for (const node of startNodes) {
      await this.prisma.task.create({
        data: {
          caseId: newCase.id,
          nodeId: node.id,
          status: 'PENDING',
        },
      });
    }

    // Log event
    await this.prisma.eventLog.create({
      data: {
        caseId: newCase.id,
        type: 'CASE_STARTED',
        payloadJson: { startNodeIds: startNodes.map((n) => n.id) },
      },
    });

    const result = await this.findOne(newCase.id);
    this.events.emitCaseStarted(result);
    return result;
  }

  /**
   * Complete a task and advance the workflow.
   * Finds the next node(s) via edges, creates new task(s), 
   * and if no outgoing edges, marks the case as completed.
   */
  async completeTask(taskId: string, userId: string) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: { case: true, node: true },
    });
    if (!task) throw new NotFoundException('Tarea no encontrada');
    if (task.status === 'DONE') throw new BadRequestException('La tarea ya está completada');

    // Mark task as DONE
    await this.prisma.task.update({
      where: { id: taskId },
      data: { status: 'DONE', finishedAt: new Date() },
    });

    // Log event
    await this.prisma.eventLog.create({
      data: {
        caseId: task.caseId,
        type: 'TASK_COMPLETED',
        payloadJson: { taskId, nodeId: task.nodeId, userId },
      },
    });

    // Get outgoing edges from the completed node
    const outgoingEdges = await this.prisma.policyEdge.findMany({
      where: { fromNodeId: task.nodeId, policyId: task.case.policyId },
      include: { toNode: true },
    });

    if (outgoingEdges.length === 0) {
      // No outgoing edges — check if all tasks in this case are done
      const pendingTasks = await this.prisma.task.count({
        where: { caseId: task.caseId, status: { not: 'DONE' } },
      });
      if (pendingTasks === 0) {
        await this.prisma.case.update({
          where: { id: task.caseId },
          data: { status: 'COMPLETED', finishedAt: new Date() },
        });
        await this.prisma.eventLog.create({
          data: {
            caseId: task.caseId,
            type: 'CASE_COMPLETED',
          },
        });
        const completedCase = await this.findOne(task.caseId);
        this.events.emitCaseCompleted(completedCase);
      }
    } else {
      // Create tasks for the next node(s)
      for (const edge of outgoingEdges) {
        // For CONDITIONAL edges, check condition (simplified: always advance for now)
        const alreadyExists = await this.prisma.task.findFirst({
          where: { caseId: task.caseId, nodeId: edge.toNodeId },
        });
        if (!alreadyExists) {
          await this.prisma.task.create({
            data: {
              caseId: task.caseId,
              nodeId: edge.toNodeId,
              status: 'PENDING',
            },
          });
        }
      }

      // Update current node in case
      if (outgoingEdges.length === 1) {
        await this.prisma.case.update({
          where: { id: task.caseId },
          data: { currentNodeId: outgoingEdges[0].toNodeId },
        });
      }
    }

    const result = await this.findOne(task.caseId);
    this.events.emitTaskCompleted(result);
    return result;
  }

  /** Assign a task to a user (officer) */
  async assignTask(taskId: string, userId: string) {
    const task = await this.prisma.task.findUnique({ where: { id: taskId } });
    if (!task) throw new NotFoundException('Tarea no encontrada');

    await this.prisma.task.update({
      where: { id: taskId },
      data: { assignedUserId: userId, status: 'IN_PROGRESS' },
    });

    await this.prisma.eventLog.create({
      data: {
        caseId: task.caseId,
        type: 'TASK_ASSIGNED',
        payloadJson: { taskId, userId },
      },
    });

    const result = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: {
        node: { include: { department: true } },
        assignedUser: { select: { id: true, name: true, email: true } },
      },
    });

    this.events.emitTaskAssigned(result);
    return result;
  }

  /** Cancel a case */
  async cancelCase(id: string) {
    const c = await this.prisma.case.findUnique({ where: { id } });
    if (!c) throw new NotFoundException('Caso no encontrado');

    await this.prisma.case.update({
      where: { id },
      data: { status: 'CANCELLED', finishedAt: new Date() },
    });

    await this.prisma.eventLog.create({
      data: {
        caseId: id,
        type: 'CASE_CANCELLED',
      },
    });

    return this.findOne(id);
  }
}
