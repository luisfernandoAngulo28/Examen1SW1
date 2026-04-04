import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AiAssistantService } from './ai-assistant.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('ai-assistant')
export class AiAssistantController {
  constructor(private aiService: AiAssistantService) {}

  /** POST /ai-assistant/prompt — Parse a text prompt into diagram actions */
  @Post('prompt')
  parsePrompt(@Body() body: { prompt: string }) {
    return this.aiService.parsePrompt(body.prompt);
  }
}
