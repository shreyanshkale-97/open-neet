import { Controller, Post, Get, Param, Body, UseGuards, Version, HttpCode, HttpStatus, NotFoundException } from '@nestjs/common';
import { TestsService } from './tests.service';
import { CreateTestDto, SubmitAnswerDto } from './dto/test.dto';
import { JwtAuthGuard } from '../../core/auth/guards/jwt-auth.guard';
import { FeatureFlagGuard } from '../../core/auth/guards/feature-flag.guard';
import { GetUser } from '../../core/auth/decorators/get-user.decorator';
import { ownPaperTests } from '../../ai/own-paper.service';

@Controller('tests')
@UseGuards(JwtAuthGuard, FeatureFlagGuard)
export class TestsController {
  constructor(private testsService: TestsService) {}

  @Post('create')
  @Version('1')
  @HttpCode(HttpStatus.CREATED)
  async createTest(@GetUser('id') userId: string, @Body() dto: CreateTestDto) {
    return this.testsService.createTestSession(userId, dto);
  }

  @Get(':id')
  @Version('1')
  async getTest(@Param('id') id: string, @GetUser('id') userId: string) {
    // Check own-paper in-memory tests first
    const ownPaperTest = ownPaperTests.get(id);
    if (ownPaperTest) {
      return ownPaperTest;
    }
    try {
      return await this.testsService.getTestSession(id, userId);
    } catch (err) {
      throw new NotFoundException(`Test session '${id}' not found`);
    }
  }

  @Post(':id/start')
  @Version('1')
  async startTest(@Param('id') id: string, @GetUser('id') userId: string) {
    const ownPaperTest = ownPaperTests.get(id);
    if (ownPaperTest) {
      ownPaperTest.status = 'IN_PROGRESS';
      ownPaperTest.startTime = new Date();
      ownPaperTest.endTime = new Date(Date.now() + 180 * 60 * 1000);
      return ownPaperTest;
    }
    return this.testsService.startTest(id, userId);
  }

  @Post(':id/answer')
  @Version('1')
  async saveAnswer(
    @Param('id') id: string,
    @GetUser('id') userId: string,
    @Body() dto: SubmitAnswerDto
  ) {
    const ownPaperTest = ownPaperTests.get(id);
    if (ownPaperTest) {
      if (!ownPaperTest.studentAnswers) ownPaperTest.studentAnswers = [];
      const existingIdx = ownPaperTest.studentAnswers.findIndex((a: any) => a.questionId === dto.questionId);
      const answerEntry = {
        questionId: dto.questionId,
        selectedOption: dto.selectedOption,
        markedForReview: dto.markedForReview || false,
        visited: dto.visited ?? true,
      };
      if (existingIdx >= 0) {
        ownPaperTest.studentAnswers[existingIdx] = answerEntry;
      } else {
        ownPaperTest.studentAnswers.push(answerEntry);
      }
      return answerEntry;
    }
    return this.testsService.saveAnswer(id, userId, dto);
  }

  @Post(':id/submit')
  @Version('1')
  async submitTest(@Param('id') id: string, @GetUser('id') userId: string) {
    const ownPaperTest = ownPaperTests.get(id);
    if (ownPaperTest) {
      ownPaperTest.status = 'SUBMITTED';
      const answers = ownPaperTest.studentAnswers || [];
      const questions = ownPaperTest.testQuestions || [];
      let correct = 0, wrong = 0, skipped = 0;
      for (const tq of questions) {
        const ans = answers.find((a: any) => a.questionId === tq.questionId);
        if (!ans || !ans.selectedOption) {
          skipped++;
        } else if (tq.question.correctOption && ans.selectedOption === tq.question.correctOption) {
          correct++;
        } else {
          wrong++;
        }
      }
      const score = (correct * 4) - (wrong * 1);
      const maxScore = questions.length * 4;
      const result = {
        score: Math.max(0, score),
        maxScore,
        correct,
        wrong,
        skipped,
        accuracy: questions.length > 0 ? parseFloat(((correct / questions.length) * 100).toFixed(1)) : 0,
        percentage: maxScore > 0 ? parseFloat(((Math.max(0, score) / maxScore) * 100).toFixed(1)) : 0,
      };
      ownPaperTest.result = result;
      ownPaperTest.report = {
        subjectBreakdown: [],
        weakTopics: [],
        strongTopics: [],
      };
      return { testId: id, result, report: ownPaperTest.report };
    }
    return this.testsService.submitTest(id, userId);
  }

  @Get(':id/result')
  @Version('1')
  async getResult(@Param('id') id: string, @GetUser('id') userId: string) {
    const ownPaperTest = ownPaperTests.get(id);
    if (ownPaperTest && ownPaperTest.result) {
      return ownPaperTest.result;
    }
    return this.testsService.getResult(id, userId);
  }

  @Get(':id/report')
  @Version('1')
  async getReport(@Param('id') id: string, @GetUser('id') userId: string) {
    const ownPaperTest = ownPaperTests.get(id);
    if (ownPaperTest && ownPaperTest.report) {
      return ownPaperTest.report;
    }
    return this.testsService.getReport(id, userId);
  }
}