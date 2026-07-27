import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { CreateTestDto, SubmitAnswerDto } from './dto/test.dto';
import { TestStatus } from '@prisma/client';

@Injectable()
export class TestsRepository {
  constructor(private prisma: PrismaService) {}

  async createTest(userId: string, dto: CreateTestDto, questionIds: string[]) {
    return this.prisma.test.create({
      data: {
        userId,
        testType: dto.testType,
        totalQuestions: questionIds.length,
        durationMinutes: dto.durationMinutes,
        difficulty: dto.difficulty || 5,
        status: TestStatus.CREATED,
        testQuestions: {
          create: questionIds.map((qid, index) => ({
            questionId: qid,
            questionOrder: index + 1,
          })),
        },
      },
      include: {
        testQuestions: {
          orderBy: { questionOrder: 'asc' },
          include: {
            question: {
              include: {
                options: true,
              },
            },
          },
        },
      },
    });
  }

  async findById(id: string) {
    return this.prisma.test.findUnique({
      where: { id },
      include: {
        testQuestions: {
          orderBy: { questionOrder: 'asc' },
          include: {
            question: {
              include: {
                options: true,
              },
            },
          },
        },
        studentAnswers: true,
        result: true,
        report: true,
      },
    });
  }

  async startTest(id: string) {
    const test = await this.findById(id);
    if (!test) return null;

    const startedAt = new Date();
    const endTime = new Date(startedAt.getTime() + test.durationMinutes * 60 * 1000);

    return this.prisma.test.update({
      where: { id },
      data: {
        status: TestStatus.IN_PROGRESS,
        startedAt,
        endTime,
      },
      include: {
        testQuestions: {
          orderBy: { questionOrder: 'asc' },
          include: {
            question: {
              include: {
                options: true,
              },
            },
          },
        },
      },
    });
  }

  async saveStudentAnswer(testId: string, userId: string, dto: SubmitAnswerDto) {
    const existing = await this.prisma.studentAnswer.findFirst({
      where: { testId, questionId: dto.questionId },
    });

    if (existing) {
      return this.prisma.studentAnswer.update({
        where: { id: existing.id },
        data: {
          selectedOption: dto.selectedOption !== undefined ? dto.selectedOption : existing.selectedOption,
          markedForReview: dto.markedForReview !== undefined ? dto.markedForReview : existing.markedForReview,
          visited: dto.visited !== undefined ? dto.visited : true,
          answeredAt: new Date(),
        },
      });
    }

    return this.prisma.studentAnswer.create({
      data: {
        testId,
        userId,
        questionId: dto.questionId,
        selectedOption: dto.selectedOption,
        markedForReview: dto.markedForReview || false,
        visited: dto.visited || true,
        answeredAt: new Date(),
      },
    });
  }

  async submitTest(id: string) {
    return this.prisma.test.update({
      where: { id },
      data: {
        status: TestStatus.SUBMITTED,
        submittedAt: new Date(),
      },
    });
  }
}