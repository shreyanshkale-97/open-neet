import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CacheService } from '../cache/cache.service';
import { FeatureFlag } from '@neet-ai/shared/types';

@Injectable()
export class FeatureFlagsService {
  private readonly logger = new Logger(FeatureFlagsService.name);
  private readonly cacheKey = 'feature-flags:all';

  constructor(
    private prisma: PrismaService,
    private cache: CacheService,
  ) {}

  async isEnabled(flag: FeatureFlag): Promise<boolean> {
    const flagsMap = await this.getAllFlags();
    return flagsMap[flag] ?? false;
  }

  async getAllFlags(): Promise<Record<string, boolean>> {
    const cached = await this.cache.get<Record<string, boolean>>(this.cacheKey);
    if (cached) return cached;

    try {
      const records = await this.prisma.featureFlagRecord.findMany();
      const map: Record<string, boolean> = {};
      for (const rec of records) {
        map[rec.flag] = rec.enabled;
      }
      await this.cache.set(this.cacheKey, map, 60); // 1 minute cache TTL
      return map;
    } catch {
      this.logger.warn('Failed to load feature flags from DB, using defaults');
      return {};
    }
  }

  async setFlag(flag: FeatureFlag, enabled: boolean, updatedBy?: string): Promise<void> {
    await this.prisma.featureFlagRecord.upsert({
      where: { flag },
      update: { enabled, updatedBy },
      create: { flag, enabled, updatedBy },
    });
    await this.cache.del(this.cacheKey);
  }
}