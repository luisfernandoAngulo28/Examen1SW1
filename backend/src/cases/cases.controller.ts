import { Controller, Get, Post, Patch, Param, Query, Body, UseGuards, Request } from '@nestjs/common';
import { CasesService } from './cases.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('cases')
export class CasesController {
  constructor(private casesService: CasesService) {}

  /** GET /cases?policyId=xxx — List all cases */
  @Get()
  findAll(@Query('policyId') policyId?: string) {
    return this.casesService.findAll(policyId);
  }

  /** GET /cases/:id — Get case detail with tasks and logs */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.casesService.findOne(id);
  }

  /** POST /cases — Start a new case from a policy */
  @Post()
  startCase(@Body() body: { policyId: string }) {
    return this.casesService.startCase(body.policyId);
  }

  /** POST /cases/tasks/:taskId/complete — Complete a task and advance workflow */
  @Post('tasks/:taskId/complete')
  completeTask(@Param('taskId') taskId: string, @Request() req: any) {
    return this.casesService.completeTask(taskId, req.user.id);
  }

  /** PATCH /cases/tasks/:taskId/assign — Assign a task to a user */
  @Patch('tasks/:taskId/assign')
  assignTask(@Param('taskId') taskId: string, @Body() body: { userId: string }) {
    return this.casesService.assignTask(taskId, body.userId);
  }

  /** PATCH /cases/:id/cancel — Cancel a case */
  @Patch(':id/cancel')
  cancelCase(@Param('id') id: string) {
    return this.casesService.cancelCase(id);
  }
}
