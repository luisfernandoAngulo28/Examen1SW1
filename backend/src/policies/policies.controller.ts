import { Controller, Get, Post, Patch, Delete, Body, Param, Put, UseGuards, Request } from '@nestjs/common';
import { PoliciesService } from './policies.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/roles.guard';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('policies')
export class PoliciesController {
  constructor(private policiesService: PoliciesService) {}

  @Get()
  findAll() {
    return this.policiesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.policiesService.findOne(id);
  }

  @Roles('DESIGNER')
  @Post()
  create(@Body() body: { name: string }, @Request() req: any) {
    return this.policiesService.create(body.name, req.user.id);
  }

  @Roles('DESIGNER')
  @Patch(':id')
  update(@Param('id') id: string, @Body() body: { name?: string; status?: 'ACTIVE' | 'INACTIVE' }) {
    return this.policiesService.update(id, body);
  }

  @Roles('DESIGNER')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.policiesService.remove(id);
  }

  @Get(':id/graph')
  getGraph(@Param('id') id: string) {
    return this.policiesService.findOne(id);
  }

  @Roles('DESIGNER')
  @Put(':id/graph')
  saveGraph(
    @Param('id') id: string,
    @Body() body: {
      nodes: { id?: string; departmentId: string; title: string; description?: string; nodeType?: string; positionX: number; positionY: number }[];
      edges: { fromNodeId: string; toNodeId: string; flowType: string; conditionLabel?: string; conditionJson?: any }[];
    },
  ) {
    return this.policiesService.saveGraph(id, body.nodes, body.edges);
  }
}
