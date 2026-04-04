import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FormsService {
  constructor(private prisma: PrismaService) {}

  /** Get form template for a node */
  async getTemplate(nodeId: string) {
    return this.prisma.formTemplate.findUnique({ where: { nodeId } });
  }

  /** Create or update form template for a node */
  async upsertTemplate(nodeId: string, schemaJson: any) {
    return this.prisma.formTemplate.upsert({
      where: { nodeId },
      create: { nodeId, schemaJson },
      update: { schemaJson },
    });
  }

  /** Submit a form for a task */
  async submitForm(taskId: string, payloadJson: any, inputMode: 'MANUAL' | 'VOICE' | 'AI' = 'MANUAL') {
    const task = await this.prisma.task.findUnique({ where: { id: taskId } });
    if (!task) throw new NotFoundException('Tarea no encontrada');

    return this.prisma.formSubmission.upsert({
      where: { taskId },
      create: { taskId, payloadJson, inputMode },
      update: { payloadJson, inputMode },
    });
  }

  /** Get form submission for a task */
  async getSubmission(taskId: string) {
    return this.prisma.formSubmission.findUnique({ where: { taskId } });
  }
}
