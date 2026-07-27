import { Injectable, Inject, Logger, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class CacheService implements OnModuleInit {
  private readonly logger = new Logger(CacheService.name);

  constructor(@Inject('REDIS_CLIENT') private readonly redisClient: Redis) {}

  onModuleInit() {
    this.redisClient.on('error', (err) => {
      this.logger.warn(`Redis connection issue: ${err.message}. Cache-aside fallback enabled.`);
    });
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await this.redisClient.get(key);
      return data ? JSON.parse(data) : null;
    } catch (err: any) {
      this.logger.warn(`Cache GET error for key '${key}': ${err.message}`);
      return null;
    }
  }

  async set(key: string, value: any, ttlSeconds?: number): Promise<void> {
    try {
      const serialized = JSON.stringify(value);
      if (ttlSeconds) {
        await this.redisClient.set(key, serialized, 'EX', ttlSeconds);
      } else {
        await this.redisClient.set(key, serialized);
      }
    } catch (err: any) {
      this.logger.warn(`Cache SET error for key '${key}': ${err.message}`);
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.redisClient.del(key);
    } catch (err: any) {
      this.logger.warn(`Cache DEL error for key '${key}': ${err.message}`);
    }
  }
}