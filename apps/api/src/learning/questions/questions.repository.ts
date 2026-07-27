import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { CreateQuestionDto, UpdateQuestionDto, SearchBankDto } from './dto/question.dto';
import { QuestionStatus } from '@prisma/client';

@Injectable()
export class QuestionsRepository {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateQuestionDto, createdBy?: string) {
    return this.prisma.question.create({
      data: {
        subjectId: dto.subjectId,
        unitId: dto.unitId,
        topicId: dto.topicId,
        questionText: dto.questionText,
        difficulty: dto.difficulty,
        questionType: dto.questionType,
        correctOption: dto.correctOption,
        explanation: dto.explanation,
        source: dto.source || 'AI_GENERATED',
        imageUrl: dto.imageUrl,
        status: QuestionStatus.PENDING_REVIEW,
        createdBy,
        options: {
          create: dto.options.map((opt) => ({
            optionLabel: opt.optionLabel,
            optionText: opt.optionText,
          })),
        },
      },
      include: {
        options: true,
        subject: true,
        unit: true,
        topic: true,
      },
    });
  }

  async findById(id: string) {
    return this.prisma.question.findUnique({
      where: { id },
      include: {
        options: true,
        subject: true,
        unit: true,
        topic: true,
        versions: {
          orderBy: { versionNumber: 'desc' },
        },
      },
    });
  }

  async findMany(params: {
    subjectId?: string;
    topicId?: string;
    status?: QuestionStatus;
    skip?: number;
    take?: number;
  }) {
    const where: any = {};
    if (params.subjectId) where.subjectId = params.subjectId;
    if (params.topicId) where.topicId = params.topicId;
    if (params.status) where.status = params.status;

    const [total, questions] = await Promise.all([
      this.prisma.question.count({ where }),
      this.prisma.question.findMany({
        where,
        skip: params.skip || 0,
        take: params.take || 20,
        orderBy: { createdAt: 'desc' },
        include: {
          options: true,
          subject: true,
          unit: true,
          topic: true,
        },
      }),
    ]);

    return { total, questions };
  }

  async searchBank(dto: SearchBankDto) {
    const where: any = {
      subjectId: dto.subjectId,
      status: QuestionStatus.APPROVED,
    };

    if (dto.unitIds && dto.unitIds.length > 0) {
      where.unitId = { in: dto.unitIds };
    }
    if (dto.topicIds && dto.topicIds.length > 0) {
      where.topicId = { in: dto.topicIds };
    }
    if (dto.minDifficulty || dto.maxDifficulty) {
      where.difficulty = {
        gte: dto.minDifficulty || 1,
        lte: dto.maxDifficulty || 10,
      };
    }
    if (dto.excludeQuestionIds && dto.excludeQuestionIds.length > 0) {
      where.id = { notIn: dto.excludeQuestionIds };
    }

    return this.prisma.question.findMany({
      where,
      take: dto.limit,
      include: {
        options: true,
      },
    });
  }

  async updateWithVersion(id: string, dto: UpdateQuestionDto, changedBy?: string) {
    const existing = await this.findById(id);
    if (!existing) return null;

    const nextVersionNumber = (existing.versions?.[0]?.versionNumber || 0) + 1;

    // Use Prisma transaction to create QuestionVersion and update Question
    return this.prisma.$transaction(async (tx) => {
      await tx.questionVersion.create({
        data: {
          questionId: id,
          versionNumber: nextVersionNumber,
          questionText: existing.questionText,
          correctOption: existing.correctOption,
          explanation: existing.explanation,
          changedBy,
        },
      });

      return tx.question.update({
        where: { id },
        data: dto,
        include: {
          options: true,
          versions: true,
        },
      });
    });
  }

  async updateStatus(id: string, status: QuestionStatus) {
    return this.prisma.question.update({
      where: { id },
      data: { status },
    });
  }

  async delete(id: string) {
    return this.prisma.question.delete({
      where: { id },
    });
  }

  async getSubjectTree() {
    return this.prisma.subject.findMany({
      orderBy: { displayOrder: 'asc' },
      include: {
        units: {
          orderBy: { displayOrder: 'asc' },
          include: {
            topics: {
              orderBy: { displayOrder: 'asc' },
            },
          },
        },
      },
    });
  }
}