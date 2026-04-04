import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DepartmentsService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.department.findMany({ include: { users: true } });
  }

  findOne(id: string) {
    return this.prisma.department.findUnique({ where: { id }, include: { users: true } });
  }

  create(name: string) {
    return this.prisma.department.create({ data: { name } });
  }

  update(id: string, name: string) {
    return this.prisma.department.update({ where: { id }, data: { name } });
  }

  remove(id: string) {
    return this.prisma.department.delete({ where: { id } });
  }
}
