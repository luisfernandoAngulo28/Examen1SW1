import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PoliciesService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.policy.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  findOne(id: string) {
    return this.prisma.policy.findUnique({
      where: { id },
      include: {
        nodes: { include: { department: true, formTemplate: true } },
        edges: true,
      },
    });
  }

  create(name: string, createdBy: string) {
    return this.prisma.policy.create({ data: { name, createdBy } });
  }

  update(id: string, data: { name?: string; status?: 'ACTIVE' | 'INACTIVE' }) {
    return this.prisma.policy.update({ where: { id }, data });
  }

  remove(id: string) {
    return this.prisma.policy.update({
      where: { id },
      data: { status: 'INACTIVE' },
    });
  }

  async saveGraph(
    policyId: string,
    nodes: { id?: string; departmentId: string; title: string; description?: string; nodeType?: string; positionX: number; positionY: number }[],
    edges: { fromNodeId: string; toNodeId: string; flowType: string; conditionLabel?: string; conditionJson?: any }[],
  ) {
    return this.prisma.$transaction(async (tx) => {
      // Get existing node IDs to clean up related records
      const existingNodes = await tx.policyNode.findMany({
        where: { policyId },
        select: { id: true },
      });
      const nodeIds = existingNodes.map((n) => n.id);

      // Delete in order respecting foreign keys
      if (nodeIds.length > 0) {
        await tx.formSubmission.deleteMany({
          where: { task: { nodeId: { in: nodeIds } } },
        });
        await tx.task.deleteMany({
          where: { nodeId: { in: nodeIds } },
        });
        await tx.formTemplate.deleteMany({
          where: { nodeId: { in: nodeIds } },
        });
      }
      await tx.policyEdge.deleteMany({ where: { policyId } });
      await tx.policyNode.deleteMany({ where: { policyId } });

      // Create new nodes
      const createdNodes: any[] = [];
      for (const node of nodes) {
        const created = await tx.policyNode.create({
          data: {
            id: node.id,
            policyId,
            departmentId: node.departmentId,
            title: node.title,
            description: node.description,
            nodeType: (node.nodeType as any) || 'ACTION',
            positionX: node.positionX,
            positionY: node.positionY,
          },
        });
        createdNodes.push(created);
      }

      // Create new edges
      for (const edge of edges) {
        await tx.policyEdge.create({
          data: {
            policyId,
            fromNodeId: edge.fromNodeId,
            toNodeId: edge.toNodeId,
            flowType: edge.flowType as any,
            conditionLabel: edge.conditionLabel,
            conditionJson: edge.conditionJson,
          },
        });
      }

      return this.findOne(policyId);
    });
  }
}
