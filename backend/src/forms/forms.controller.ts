import { Controller, Get, Put, Post, Param, Body, UseGuards } from '@nestjs/common';
import { FormsService } from './forms.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('forms')
export class FormsController {
  constructor(private formsService: FormsService) {}

  /** GET /forms/template/:nodeId — Get form template for a node */
  @Get('template/:nodeId')
  getTemplate(@Param('nodeId') nodeId: string) {
    return this.formsService.getTemplate(nodeId);
  }

  /** PUT /forms/template/:nodeId — Create/update form template */
  @Put('template/:nodeId')
  upsertTemplate(@Param('nodeId') nodeId: string, @Body() body: { schemaJson: any }) {
    return this.formsService.upsertTemplate(nodeId, body.schemaJson);
  }

  /** POST /forms/submit/:taskId — Submit form data for a task */
  @Post('submit/:taskId')
  submitForm(@Param('taskId') taskId: string, @Body() body: { payloadJson: any; inputMode?: 'MANUAL' | 'VOICE' | 'AI' }) {
    return this.formsService.submitForm(taskId, body.payloadJson, body.inputMode);
  }

  /** GET /forms/submission/:taskId — Get submitted form for a task */
  @Get('submission/:taskId')
  getSubmission(@Param('taskId') taskId: string) {
    return this.formsService.getSubmission(taskId);
  }
}
