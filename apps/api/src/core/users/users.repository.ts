import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { UpdateProfileDto } from './dto/update-user.dto';

@Injectable()
export class UsersRepository {
  constructor(private prisma: PrismaService) {}

  async findById(id: string) {
    return this.prisma.profile.findUnique({
      where: { id },
      include: { studyStats: true },
    });
  }

  async findByAuthId(authUserId: string) {
    return this.prisma.profile.findUnique({
      where: { authUserId },
      include: { studyStats: true },
    });
  }

  async update(id: string, dto: UpdateProfileDto) {
    return this.prisma.profile.update({
      where: { id },
      data: dto,
      include: { studyStats: true },
    });
  }

  async getRecentTests(userId: string, limit = 5) {
    return this.prisma.test.findMany({
      where: { userId },
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { result: true },
    });
  }

  async getActiveTest(userId: string) {
    return this.prisma.test.findFirst({
      where: { userId, status: 'IN_PROGRESS' },
      include: { testQuestions: true },
    });
  }
}