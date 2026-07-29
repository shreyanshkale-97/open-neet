import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TestsRepository } from './tests.repository';
import { QuestionsRepository } from '../../learning/questions/questions.repository';
import { EvaluationService } from '../evaluation/evaluation.service';
import { ReportsService } from '../reports/reports.service';
import { CreateTestDto, SubmitAnswerDto } from './dto/test.dto';
import { TestSubmittedEvent, TestEvaluatedEvent } from '../../infrastructure/events/event-types';
import { ownPaperTests } from '../../ai/own-paper.service';

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
    if (id.startsWith('own_paper_') && ownPaperTests.has(id)) {
      return ownPaperTests.get(id);
    }

    try {
      const test = await this.testsRepo.findById(id);
      if (test) return test;
    } catch (err) {
      // Prisma fallback for own paper sessions
    }

    if (ownPaperTests.has(id)) {
      return ownPaperTests.get(id);
    }

    throw new NotFoundException(`Test session '${id}' not found`);
  }

  async startTest(id: string, userId: string) {
    if (id.startsWith('own_paper_') && ownPaperTests.has(id)) {
      const test = ownPaperTests.get(id);
      test.status = 'IN_PROGRESS';
      test.startedAt = new Date().toISOString();
      const endTime = new Date(Date.now() + (test.durationMinutes || 180) * 60 * 1000).toISOString();
      test.endTime = endTime;
      ownPaperTests.set(id, test);
      return test;
    }
    await this.getTestSession(id, userId);
    return this.testsRepo.startTest(id);
  }

  async saveAnswer(id: string, userId: string, dto: SubmitAnswerDto) {
    if (id.startsWith('own_paper_') && ownPaperTests.has(id)) {
      const test = ownPaperTests.get(id);
      let answer = test.studentAnswers.find((a: any) => a.questionId === dto.questionId);
      if (!answer) {
        answer = {
          id: `ans_${Date.now()}`,
          questionId: dto.questionId,
          selectedOption: dto.selectedOption,
          markedForReview: dto.markedForReview || false,
          visited: dto.visited || true,
        };
        test.studentAnswers.push(answer);
      } else {
        if (dto.selectedOption !== undefined) answer.selectedOption = dto.selectedOption;
        if (dto.markedForReview !== undefined) answer.markedForReview = dto.markedForReview;
        if (dto.visited !== undefined) answer.visited = dto.visited;
      }
      ownPaperTests.set(id, test);
      return answer;
    }
    await this.getTestSession(id, userId);
    return this.testsRepo.saveStudentAnswer(id, userId, dto);
  }

  async submitTest(id: string, userId: string) {
    if (id.startsWith('own_paper_') && ownPaperTests.has(id)) {
      const test = ownPaperTests.get(id);
      test.status = 'SUBMITTED';
      test.submittedAt = new Date().toISOString();

      let correct = 0;
      let incorrect = 0;
      let unattempted = 0;

      for (const tq of test.testQuestions) {
        const ans = test.studentAnswers.find((a: any) => a.questionId === tq.question.id || a.questionId === tq.id);
        const selectedOpt = ans ? ans.selectedOption : undefined;
        if (selectedOpt === null || selectedOpt === undefined) {
          unattempted++;
        } else {
          // Compare with correct option
          const optIdx = typeof selectedOpt === 'number' ? selectedOpt : parseInt(String(selectedOpt), 10);
          if (tq.question.correctOptionIndex !== null && !isNaN(optIdx) && optIdx === tq.question.correctOptionIndex) {
            correct++;
          } else {
            incorrect++;
          }
        }
      }

      const score = (correct * 4) - (incorrect * 1);
      const maxScore = test.testQuestions.length * 4;
      const totalAttempted = correct + incorrect;
      const accuracy = totalAttempted > 0 ? Math.round((correct / totalAttempted) * 100) : 0;

      test.result = {
        testId: id,
        score,
        maxScore,
        accuracy,
        totalQuestions: test.testQuestions.length,
        correctAnswersCount: correct,
        incorrectAnswersCount: incorrect,
        unattemptedCount: unattempted,
      };

      test.report = {
        testId: id,
        overallScore: score,
        accuracyPercent: accuracy,
        totalTimeSeconds: 180,
        weakTopics: [],
        strongTopics: [],
      };

      ownPaperTests.set(id, test);
      return {
        testId: id,
        result: test.result,
        report: test.report,
      };
    }

    const test = await this.getTestSession(id, userId);
    if (test.status === 'SUBMITTED' || test.status === 'EVALUATED') {
      throw new BadRequestException('Test session has already been submitted.');
    }

    await this.testsRepo.submitTest(id);
    this.eventEmitter.emit('test.submitted', new TestSubmittedEvent(id, userId));

    const result = await this.evalService.evaluateTest(id);
    this.eventEmitter.emit(
      'test.evaluated',
      new TestEvaluatedEvent(id, userId, result.score, result.maxScore, result.accuracy)
    );

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