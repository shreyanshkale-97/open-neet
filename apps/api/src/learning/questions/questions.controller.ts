import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  Version,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { CreateQuestionDto, UpdateQuestionDto, SearchBankDto } from './dto/question.dto';
import { JwtAuthGuard } from '../../core/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../core/auth/guards/roles.guard';
import { Roles } from '../../core/auth/decorators/roles.decorator';
import { GetUser } from '../../core/auth/decorators/get-user.decorator';
import { Role, QuestionStatus } from '@neet-ai/shared/types';

@Controller('questions')
export class QuestionsController {
  constructor(private questionsService: QuestionsService) {}

  @Get('subjects')
  @Version('1')
  async getSubjectTree() {
    return this.questionsService.getSubjectTree();
  }

  @Post()
  @Version('1')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createQuestion(@Body() dto: CreateQuestionDto, @GetUser('id') userId: string) {
    return this.questionsService.createQuestion(dto, userId);
  }

  @Get('bank/search')
  @Version('1')
  @UseGuards(JwtAuthGuard)
  async searchBank(@Query() dto: SearchBankDto) {
    return this.questionsService.searchBank(dto);
  }

  @Get()
  @Version('1')
  async getQuestions(
    @Query('subjectId') subjectId?: string,
    @Query('topicId') topicId?: string,
    @Query('status') status?: QuestionStatus,
    @Query('page') page?: number,
    @Query('limit') limit?: number
  ) {
    return this.questionsService.getQuestions({
      subjectId,
      topicId,
      status,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
    });
  }

  @Get(':id')
  @Version('1')
  async getQuestion(@Param('id') id: string) {
    return this.questionsService.getQuestion(id);
  }

  @Patch(':id')
  @Version('1')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.CONTENT_MANAGER, Role.AI_REVIEWER)
  async updateQuestion(
    @Param('id') id: string,
    @Body() dto: UpdateQuestionDto,
    @GetUser('id') userId: string
  ) {
    return this.questionsService.updateQuestion(id, dto, userId);
  }

  @Post(':id/approve')
  @Version('1')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.AI_REVIEWER)
  async approveQuestion(@Param('id') id: string) {
    return this.questionsService.approveQuestion(id);
  }

  @Post(':id/reject')
  @Version('1')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.AI_REVIEWER)
  async rejectQuestion(@Param('id') id: string) {
    return this.questionsService.rejectQuestion(id);
  }

  @Delete(':id')
  @Version('1')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async deleteQuestion(@Param('id') id: string) {
    return this.questionsService.deleteQuestion(id);
  }
}