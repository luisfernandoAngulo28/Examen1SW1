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
    nodes: { id?: string; departmentId: string; title: string; description?: string; positionX: number; positionY: number }[],
    edges: { fromNodeId: string; toNodeId: string; flowType: string; conditionJson?: any }[],
  ) {
    // Delete existing nodes and edges
    await this.prisma.policyEdge.deleteMany({ where: { policyId } });
    await this.prisma.policyNode.deleteMany({ where: { policyId } });

    // Create new nodes
    const createdNodes: any[] = [];
    for (const node of nodes) {
      const created = await this.prisma.policyNode.create({
        data: {
          id: node.id,
          policyId,
          departmentId: node.departmentId,
          title: node.title,
          description: node.description,
          positionX: node.positionX,
          positionY: node.positionY,
        },
      });
      createdNodes.push(created);
    }

    // Create new edges
    for (const edge of edges) {
      await this.prisma.policyEdge.create({
        data: {
          policyId,
          fromNodeId: edge.fromNodeId,
          toNodeId: edge.toNodeId,
          flowType: edge.flowType as any,
          conditionJson: edge.conditionJson,
        },
      });
    }

    return this.findOne(policyId);
  }
}
