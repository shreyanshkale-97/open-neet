import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TestsRepository } from './tests.repository';
import { QuestionsRepository } from '../../learning/questions/questions.repository';
import { EvaluationService } from '../evaluation/evaluation.service';
import { ReportsService } from '../reports/reports.service';
import { CreateTestDto, SubmitAnswerDto } from './dto/test.dto';
import { TestSubmittedEvent, TestEvaluatedEvent } from '../../infrastructure/events/event-types';

@Injectable()
export class TestsService {
  constructor(
    private testsRepo: TestsRepository,
    private questionsRepo: QuestionsRepository,
    private evalService: EvaluationService,
    private reportsService: ReportsService,
    private eventEmitter: EventEmitter2
  ) {}

  async createTestSession(userId: string, dto: CreateTestDto) {
    let selectedQuestionIds: string[] = dto.questionIds || [];

    // Auto-assemble from question bank if questionIds not provided
    if (selectedQuestionIds.length === 0) {
      const bankQuestions = await this.questionsRepo.searchBank({
        subjectId: dto.subjectId || '',
        unitIds: dto.unitIds,
        topicIds: dto.topicIds,
        minDifficulty: dto.difficulty ? Math.max(1, dto.difficulty - 2) : 1,
        maxDifficulty: dto.difficulty ? Math.min(10, dto.difficulty + 2) : 10,
        limit: dto.totalQuestions,
      });

      selectedQuestionIds = bankQuestions.map((q) => q.id);
    }

    if (selectedQuestionIds.length === 0) {
      throw new BadRequestException('No matching questions found in question bank for test generation.');
    }

    return this.testsRepo.createTest(userId, dto, selectedQuestionIds);
  }

  async getTestSession(id: string, userId: string) {
    const test = await this.testsRepo.findById(id);
    if (!test) {
      throw new NotFoundException(`Test session '${id}' not found`);
    }
    if (test.userId !== userId) {
      throw new BadRequestException('Unauthorized access to test session');
    }
    return test;
  }

  async startTest(id: string, userId: string) {
    await this.getTestSession(id, userId);
    return this.testsRepo.startTest(id);
  }

  async saveAnswer(id: string, userId: string, dto: SubmitAnswerDto) {
    await this.getTestSession(id, userId);
    return this.testsRepo.saveStudentAnswer(id, userId, dto);
  }

  async submitTest(id: string, userId: string) {
    const test = await this.getTestSession(id, userId);
    if (test.status === 'SUBMITTED' || test.status === 'EVALUATED') {
      throw new BadRequestException('Test session has already been submitted.');
    }

    await this.testsRepo.submitTest(id);
    this.eventEmitter.emit('test.submitted', new TestSubmittedEvent(id, userId));

    // Evaluate test (NEET scoring)
    const result = await this.evalService.evaluateTest(id);
    this.eventEmitter.emit(
      'test.evaluated',
      new TestEvaluatedEvent(id, userId, result.score, result.maxScore, result.accuracy)
    );

    // Generate analytics report
    const report = await this.reportsService.generateReport(id);

    return {
      testId: id,
      result,
      report,
    };
  }

  async getResult(id: string, userId: string) {
    const test = await this.getTestSession(id, userId);
    if (!test.result) {
      throw new NotFoundException('Test result not available yet');
    }
    return test.result;
  }

  async getReport(id: string, userId: string) {
    const test = await this.getTestSession(id, userId);
    if (!test.report) {
      throw new NotFoundException('Test report not available yet');
    }
    return test.report;
  }
}