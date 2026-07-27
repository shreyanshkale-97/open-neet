import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { CacheService } from '../../infrastructure/cache/cache.service';
import { UpdateProfileDto } from './dto/update-user.dto';
import { DashboardStats } from '@neet-ai/shared/types';

@Injectable()
export class UsersService {
  constructor(
    private usersRepo: UsersRepository,
    private cache: CacheService
  ) {}

  async getProfile(userId: string) {
    const profile = await this.usersRepo.findById(userId);
    if (!profile) {
      throw new NotFoundException('User profile not found');
    }
    return profile;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const updated = await this.usersRepo.update(userId, dto);
    await this.cache.del(`dashboard:${userId}`);
    return updated;
  }

  async getDashboard(userId: string): Promise<DashboardStats> {
    const cacheKey = `dashboard:${userId}`;
    const cached = await this.cache.get<DashboardStats>(cacheKey);
    if (cached) return cached;

    const profile = await this.usersRepo.findById(userId);
    if (!profile) {
      throw new NotFoundException('User profile not found');
    }

    const recentTests = await this.usersRepo.getRecentTests(userId, 5);
    const activeTest = await this.usersRepo.getActiveTest(userId);

    // Calculate score metrics
    const results = recentTests.map((t) => t.result).filter(Boolean);
    const highestScore = results.length > 0 ? Math.max(...results.map((r) => r!.score)) : 0;
    const averageScore = results.length > 0 ? Math.round(results.reduce((acc, r) => acc + r!.score, 0) / results.length) : 0;

    const stats: DashboardStats = {
      highestScore,
      averageScore,
      studyStreakDays: profile.studyStats?.studyStreakDays ?? 0,
      totalStudyHours: profile.studyStats?.totalStudyHours ?? 0,
      totalTestsTaken: profile.studyStats?.totalTestsTaken ?? 0,
      weakTopics: [],
      strongTopics: [],
      activeTest: activeTest as any,
      recentTests: recentTests as any,
    };

    await this.cache.set(cacheKey, stats, 300); // 5-minute Redis cache
    return stats;
  }

  async getHistory(userId: string) {
    return this.usersRepo.getRecentTests(userId, 20);
  }
}