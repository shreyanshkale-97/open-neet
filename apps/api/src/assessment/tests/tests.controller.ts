import { Controller, Post, Get, Param, Body, UseGuards, Version, HttpCode, HttpStatus } from '@nestjs/common';
import { TestsService } from './tests.service';
import { CreateTestDto, SubmitAnswerDto } from './dto/test.dto';
import { JwtAuthGuard } from '../../core/auth/guards/jwt-auth.guard';
import { FeatureFlagGuard } from '../../core/auth/guards/feature-flag.guard';
import { GetUser } from '../../core/auth/decorators/get-user.decorator';

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
    return this.testsService.getTestSession(id, userId);
  }

  @Post(':id/start')
  @Version('1')
  async startTest(@Param('id') id: string, @GetUser('id') userId: string) {
    return this.testsService.startTest(id, userId);
  }

  @Post(':id/answer')
  @Version('1')
  async saveAnswer(
    @Param('id') id: string,
    @GetUser('id') userId: string,
    @Body() dto: SubmitAnswerDto
  ) {
    return this.testsService.saveAnswer(id, userId, dto);
  }

  @Post(':id/submit')
  @Version('1')
  async submitTest(@Param('id') id: string, @GetUser('id') userId: string) {
    return this.testsService.submitTest(id, userId);
  }

  @Get(':id/result')
  @Version('1')
  async getResult(@Param('id') id: string, @GetUser('id') userId: string) {
    return this.testsService.getResult(id, userId);
  }

  @Get(':id/report')
  @Version('1')
  async getReport(@Param('id') id: string, @GetUser('id') userId: string) {
    return this.testsService.getReport(id, userId);
  }
}