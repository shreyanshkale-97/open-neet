import { Controller, Post, Get, Param, Body, UseGuards, Version, UseInterceptors } from '@nestjs/common';
import { AiService } from './ai.service';
import { GenerateQuestionsDto } from './dto/ai.dto';
import { JwtAuthGuard } from '../core/auth/guards/jwt-auth.guard';
import { AiCostInterceptor } from './interceptors/ai-cost.interceptor';
import { GetUser } from '../core/auth/decorators/get-user.decorator';

@Controller('ai')
@UseGuards(JwtAuthGuard)
@UseInterceptors(AiCostInterceptor)
export class AiController {
  constructor(private aiService: AiService) {}

  @Post('generate-questions')
  @Version('1')
  async generateQuestions(
    @Body() dto: GenerateQuestionsDto,
    @GetUser('id') userId: string
  ) {
    return this.aiService.createQuestionGenerationJob(dto, userId);
  }

  @Get('jobs/:id')
  @Version('1')
  async getJobStatus(@Param('id') id: string) {
    return this.aiService.getJob(id);
  }
}