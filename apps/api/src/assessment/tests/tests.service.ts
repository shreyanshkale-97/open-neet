import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TestsRepository } from './tests.repository';
import { QuestionsRepository } from '../../learning/questions/questions.repository';
import { EvaluationService } from '../evaluation/evaluation.service';
import { ReportsService } from '../reports/reports.service';
import { CreateTestDto, SubmitAnswerDto } from './dto/test.dto';
import { TestSubmittedEvent, TestEvaluatedEvent } from '../../infrastructure/events/event-types';
import { ownPaperTests } from '../../ai/own-paper.service';
import { NEET_QUESTION_BANK_DATASET } from '../../ai/datasets/neet-question-bank.dataset';

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
      try {
        const bankQuestions = await this.questionsRepo.searchBank({
          subjectId: dto.subjectId || '',
          unitIds: dto.unitIds,
          topicIds: dto.topicIds,
          minDifficulty: dto.difficulty ? Math.max(1, dto.difficulty - 2) : 1,
          maxDifficulty: dto.difficulty ? Math.min(10, dto.difficulty + 2) : 10,
          limit: dto.totalQuestions,
        });

        selectedQuestionIds = bankQuestions.map((q) => q.id);
      } catch (err) {
        // Fallback to dataset
      }
    }

    // Fallback: If DB bank has no questions, create dynamic test session from NEET Question Bank Dataset with anti-repetition
    if (selectedQuestionIds.length === 0) {
      const targetSub = (dto.subjectId || 'physics').toLowerCase();
      let matchedDataset = NEET_QUESTION_BANK_DATASET.filter((q) => q.subjectId.toLowerCase() === targetSub);
      if (matchedDataset.length === 0) matchedDataset = NEET_QUESTION_BANK_DATASET;

      // Shuffle dataset so consecutive tests do not start with the same question
      const shuffledDataset = [...matchedDataset].sort(() => 0.5 - Math.random());

      const neededCount = dto.totalQuestions || 10;
      const testId = `dynamic_test_${Date.now()}`;

      const testQuestions = Array.from({ length: neededCount }).map((_, idx) => {
        const item = shuffledDataset[idx % shuffledDataset.length];
        const qId = `${item.id}_t_${Date.now()}_${idx + 1}`;
        return {
          id: `tq_${idx + 1}`,
          questionId: qId,
          displayOrder: idx + 1,
          question: {
            id: qId,
            questionNumber: idx + 1,
            questionText: item.questionText,
            questionType: item.questionType,
            difficulty: item.difficulty,
            hasImage: item.hasImage || false,
            imageUrl: item.hasImage ? (item.imageUrl || `/api/v1/ai/storage/diagrams/${item.id}.png`) : undefined,
            options: item.options.map((opt, oIdx) => ({
              id: `opt_${idx + 1}_${oIdx}`,
              optionLabel: opt.optionLabel,
              optionText: opt.optionText,
            })),
            optionA: item.options[0]?.optionText || '',
            optionB: item.options[1]?.optionText || '',
            optionC: item.options[2]?.optionText || '',
            optionD: item.options[3]?.optionText || '',
            correctOption: item.correctOption,
            correctOptionIndex: ['A', 'B', 'C', 'D'].indexOf(item.correctOption),
            explanation: item.explanation,
            ncertReference: item.ncertReference,
          },
        };
      });

      const dynamicSession = {
        id: testId,
        title: `NEET 2027 Mock Test — ${dto.testType || 'Practice'}`,
        subjectId: dto.subjectId,
        status: 'CREATED',
        totalQuestions: neededCount,
        durationMinutes: dto.durationMinutes || 180,
        createdAt: new Date().toISOString(),
        testQuestions,
        studentAnswers: [],
      };

      ownPaperTests.set(testId, dynamicSession);
      return dynamicSession;
    }

    return this.testsRepo.createTest(userId, dto, selectedQuestionIds);
  }

  async getTestSession(id: string, userId: string) {
    if ((id.startsWith('own_paper_') || id.startsWith('dynamic_test_')) && ownPaperTests.has(id)) {
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
    if ((id.startsWith('own_paper_') || id.startsWith('dynamic_test_')) && ownPaperTests.has(id)) {
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
    if ((id.startsWith('own_paper_') || id.startsWith('dynamic_test_')) && ownPaperTests.has(id)) {
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
    if ((id.startsWith('own_paper_') || id.startsWith('dynamic_test_')) && ownPaperTests.has(id)) {
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