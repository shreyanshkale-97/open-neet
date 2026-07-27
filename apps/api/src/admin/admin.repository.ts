import { Injectable } from '@nestjs/common';
import { PrismaService } from '../infrastructure/database/prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class AdminRepository {
  constructor(private prisma: PrismaService) {}

  async getAnalyticsStats() {
    const [totalUsers, totalQuestions, totalTests, totalJobs, aiCostSum] = await Promise.all([
      this.prisma.profile.count(),
      this.prisma.question.count(),
      this.prisma.test.count(),
      this.prisma.aiJob.count(),
      this.prisma.aiCostLog.aggregate({
        _sum: {
          estimatedCostUsd: true,
          totalTokens: true,
        },
      }),
    ]);

    const approvedQuestions = await this.prisma.question.count({ where: { status: 'APPROVED' } });
    const pendingQuestions = await this.prisma.question.count({ where: { status: 'PENDING_REVIEW' } });

    return {
      totalUsers,
      totalQuestions,
      approvedQuestions,
      pendingQuestions,
      totalTests,
      totalJobs,
      totalAiTokens: aiCostSum._sum.totalTokens || 0,
      totalAiCostUsd: Number(aiCostSum._sum.estimatedCostUsd || 0),
    };
  }

  async getUsers(skip = 0, take = 20, search?: string) {
    const where: any = {};
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [total, users] = await Promise.all([
      this.prisma.profile.count({ where }),
      this.prisma.profile.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: { studyStats: true },
      }),
    ]);

    return { total, users };
  }

  async updateUserRole(id: string, role: Role) {
    return this.prisma.profile.update({
      where: { id },
      data: { role },
    });
  }

  async updateUserSuspension(id: string, isSuspended: boolean) {
    return this.prisma.profile.update({
      where: { id },
      data: { isSuspended },
    });
  }

  async getAuditLogs(skip = 0, take = 20) {
    const [total, logs] = await Promise.all([
      this.prisma.auditLog.count(),
      this.prisma.auditLog.findMany({
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: { admin: true },
      }),
    ]);

    return { total, logs };
  }
}