import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { CacheService } from '../../infrastructure/cache/cache.service';
import { UpdateProfileDto } from './dto/update-user.dto';
import { DashboardStats } from '@neet-ai/shared/types';
import { inMemoryProfiles } from '../auth/auth.service';

@Injectable()
export class UsersService {
  constructor(
    private usersRepo: UsersRepository,
    private cache: CacheService
  ) {}

  async getProfile(userId: string, currentUser?: any) {
    try {
      const profile = await this.usersRepo.findById(userId);
      if (profile) return profile;
    } catch (err) {
      // Prisma offline fallback
    }

    if (inMemoryProfiles.has(userId)) {
      return inMemoryProfiles.get(userId);
    }

    if (currentUser) return currentUser;

    return {
      id: userId,
      authUserId: userId,
      email: 'student@example.com',
      fullName: 'NEET Student',
      role: 'STUDENT',
      targetNeetYear: 2025,
      studyStats: {
        studyStreakDays: 1,
        totalStudyHours: 0,
        totalTestsTaken: 0,
      },
    };
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    try {
      const updated = await this.usersRepo.update(userId, dto);
      await this.cache.del(`dashboard:${userId}`);
      return updated;
    } catch (err) {
      const profile = inMemoryProfiles.get(userId) || {};
      Object.assign(profile, dto);
      inMemoryProfiles.set(userId, profile);
      return profile;
    }
  }

  async getDashboard(userId: string): Promise<DashboardStats> {
    const cacheKey = `dashboard:${userId}`;
    try {
      const cached = await this.cache.get<DashboardStats>(cacheKey);
      if (cached) return cached;
    } catch (err) {}

    let profile: any = null;
    try {
      profile = await this.usersRepo.findById(userId);
    } catch (err) {}

    if (!profile) {
      profile = inMemoryProfiles.get(userId) || {
        studyStats: { studyStreakDays: 1, totalStudyHours: 0, totalTestsTaken: 0 },
      };
    }

    let recentTests: any[] = [];
    let activeTest: any = null;

    try {
      recentTests = await this.usersRepo.getRecentTests(userId, 5);
      activeTest = await this.usersRepo.getActiveTest(userId);
    } catch (err) {}

    const results = recentTests.map((t) => t.result).filter(Boolean);
    const highestScore = results.length > 0 ? Math.max(...results.map((r) => r!.score)) : 0;
    const averageScore = results.length > 0 ? Math.round(results.reduce((acc, r) => acc + r!.score, 0) / results.length) : 0;

    const stats: DashboardStats = {
      highestScore,
      averageScore,
      studyStreakDays: profile.studyStats?.studyStreakDays ?? 1,
      totalStudyHours: profile.studyStats?.totalStudyHours ?? 0,
      totalTestsTaken: profile.studyStats?.totalTestsTaken ?? 0,
      weakTopics: [],
      strongTopics: [],
      activeTest: activeTest as any,
      recentTests: recentTests as any,
    };

    try {
      await this.cache.set(cacheKey, stats, 300);
    } catch (err) {}

    return stats;
  }

  async getHistory(userId: string) {
    try {
      return await this.usersRepo.getRecentTests(userId, 20);
    } catch (err) {
      return [];
    }
  }
}