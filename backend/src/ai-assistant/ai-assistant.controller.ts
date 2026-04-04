import { Controller, Post, Body, UseGuards, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
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

  /** POST /ai-assistant/image — Receive extracted text from image and parse */
  @Post('image')
  parseImage(@Body() body: { extractedText: string; fileName?: string }) {
    return this.aiService.parseImageText(body.extractedText, body.fileName);
  }
}
