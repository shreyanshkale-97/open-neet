import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { NEET_SCORING } from '@neet-ai/shared/constants';

@Injectable()
export class EvaluationService {
  private readonly logger = new Logger(EvaluationService.name);

  constructor(private prisma: PrismaService) {}

  async evaluateTest(testId: string) {
    const test = await this.prisma.test.findUnique({
      where: { id: testId },
      include: {
        testQuestions: {
          include: {
            question: true,
          },
        },
        studentAnswers: true,
      },
    });

    if (!test) throw new Error(`Test '${testId}' not found`);

    let correctCount = 0;
    let wrongCount = 0;
    let skippedCount = 0;
    let totalScore = 0;
    let negativeMarks = 0;

    const answerMap = new Map(test.studentAnswers.map((a) => [a.questionId, a]));

    for (const tq of test.testQuestions) {
      const q = tq.question;
      const ans = answerMap.get(q.id);

      if (!ans || !ans.selectedOption) {
        skippedCount++;
        if (ans) {
          await this.prisma.studentAnswer.update({
            where: { id: ans.id },
            data: { isCorrect: null },
          });
        }
      } else if (ans.selectedOption === q.correctOption) {
        correctCount++;
        totalScore += NEET_SCORING.CORRECT_MARKS; // +4
        await this.prisma.studentAnswer.update({
          where: { id: ans.id },
          data: { isCorrect: true },
        });
      } else {
        wrongCount++;
        totalScore += NEET_SCORING.WRONG_MARKS; // -1
        negativeMarks += Math.abs(NEET_SCORING.WRONG_MARKS); // 1
        await this.prisma.studentAnswer.update({
          where: { id: ans.id },
          data: { isCorrect: false },
        });
      }
    }

    const attemptedCount = correctCount + wrongCount;
    const accuracy = attemptedCount > 0 ? Number(((correctCount / attemptedCount) * 100).toFixed(2)) : 0;
    const maxScore = test.totalQuestions * NEET_SCORING.CORRECT_MARKS;

    const startTime = test.startedAt || test.createdAt;
    const endTime = test.submittedAt || new Date();
    const timeTakenSeconds = Math.max(0, Math.floor((endTime.getTime() - startTime.getTime()) / 1000));

    // Save Result record
    const result = await this.prisma.result.upsert({
      where: { testId },
      update: {
        score: totalScore,
        maxScore,
        correct: correctCount,
        wrong: wrongCount,
        skipped: skippedCount,
        accuracy,
        negativeMarks,
        timeTakenSeconds,
      },
      create: {
        testId,
        score: totalScore,
        maxScore,
        correct: correctCount,
        wrong: wrongCount,
        skipped: skippedCount,
        accuracy,
        negativeMarks,
        timeTakenSeconds,
      },
    });

    // Update Test status to EVALUATED
    await this.prisma.test.update({
      where: { id: testId },
      data: { status: 'EVALUATED' },
    });

    this.logger.log(`Test ${testId} evaluated: Score ${totalScore}/${maxScore}, Accuracy ${accuracy}%`);
    return result;
  }
}