import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);

  constructor(private prisma: PrismaService) {}

  async generateReport(testId: string) {
    const test = await this.prisma.test.findUnique({
      where: { id: testId },
      include: {
        result: true,
        testQuestions: {
          include: {
            question: {
              include: {
                subject: true,
                topic: true,
              },
            },
          },
        },
        studentAnswers: true,
      },
    });

    if (!test || !test.result) {
      throw new Error(`Test '${testId}' has not been evaluated yet.`);
    }

    const answerMap = new Map(test.studentAnswers.map((a) => [a.questionId, a]));

    const subjectStats: Record<string, { total: number; correct: number; wrong: number; skipped: number }> = {};
    const topicStats: Record<string, { name: string; total: number; correct: number; wrong: number; skipped: number }> = {};

    for (const tq of test.testQuestions) {
      const q = tq.question;
      const subName = q.subject.name;
      const topName = q.topic.name;

      if (!subjectStats[subName]) subjectStats[subName] = { total: 0, correct: 0, wrong: 0, skipped: 0 };
      if (!topicStats[topName]) topicStats[topName] = { name: topName, total: 0, correct: 0, wrong: 0, skipped: 0 };

      subjectStats[subName].total++;
      topicStats[topName].total++;

      const ans = answerMap.get(q.id);
      if (!ans || !ans.selectedOption) {
        subjectStats[subName].skipped++;
        topicStats[topName].skipped++;
      } else if (ans.isCorrect) {
        subjectStats[subName].correct++;
        topicStats[topName].correct++;
      } else {
        subjectStats[subName].wrong++;
        topicStats[topName].wrong++;
      }
    }

    // Rank weak topics (lowest accuracy) and strong topics (highest accuracy)
    const topicList = Object.values(topicStats).map((t) => ({
      name: t.name,
      accuracy: t.correct + t.wrong > 0 ? Number(((t.correct / (t.correct + t.wrong)) * 100).toFixed(1)) : 0,
      total: t.total,
    }));

    topicList.sort((a, b) => a.accuracy - b.accuracy);
    const weakTopics = topicList.slice(0, 3);
    const strongTopics = [...topicList].reverse().slice(0, 3);

    // Save Report record
    const report = await this.prisma.report.upsert({
      where: { testId },
      update: {
        subjectBreakdown: subjectStats as any,
        topicBreakdown: topicStats as any,
        weakTopics: weakTopics as any,
        strongTopics: strongTopics as any,
      },
      create: {
        testId,
        subjectBreakdown: subjectStats as any,
        topicBreakdown: topicStats as any,
        weakTopics: weakTopics as any,
        strongTopics: strongTopics as any,
      },
    });

    // Update student StudyStats
    await this.prisma.studyStats.updateMany({
      where: { profileId: test.userId },
      data: {
        totalTestsTaken: { increment: 1 },
        totalStudyHours: { increment: Number((test.result.timeTakenSeconds / 3600).toFixed(2)) },
        lastActiveAt: new Date(),
      },
    });

    this.logger.log(`Report generated for Test ${testId}`);
    return report;
  }
}