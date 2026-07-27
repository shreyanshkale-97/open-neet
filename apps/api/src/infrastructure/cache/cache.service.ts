import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class CacheService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(CacheService.name);
  private client: Redis | null = null;
  private readonly defaultTtl: number;

  constructor(private configService: ConfigService) {
    this.defaultTtl = this.configService.get<number>('redis.ttlSeconds') ?? 300;
  }

  async onModuleInit() {
    const redisUrl = this.configService.get<string>('redis.url') ?? 'redis://localhost:6379';
    try {
      this.client = new Redis(redisUrl, {
        maxRetriesPerRequest: 3,
        lazyConnect: true,
      });
      await this.client.connect();
      this.logger.log(`Connected to Redis at ${redisUrl}`);
    } catch (err) {
      this.logger.warn(`Redis connection failed (${err instanceof Error ? err.message : 'Unknown error'}). Falling back to in-memory/no-op cache.`);
      this.client = null;
    }
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.quit();
    }
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.client) return null;
    try {
      const data = await this.client.get(key);
      if (!data) return null;
      return JSON.parse(data) as T;
    } catch (err) {
      this.logger.error(`Cache GET error for key ${key}: ${err}`);
      return null;
    }
  }

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    if (!this.client) return;
    try {
      const ttl = ttlSeconds ?? this.defaultTtl;
      const data = JSON.stringify(value);
      await this.client.setex(key, ttl, data);
    } catch (err) {
      this.logger.error(`Cache SET error for key ${key}: ${err}`);
    }
  }

  async del(key: string): Promise<void> {
    if (!this.client) return;
    try {
      await this.client.del(key);
    } catch (err) {
      this.logger.error(`Cache DEL error for key ${key}: ${err}`);
    }
  }

  async invalidatePattern(pattern: string): Promise<void> {
    if (!this.client) return;
    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(...keys);
      }
    } catch (err) {
      this.logger.error(`Cache invalidatePattern error for pattern ${pattern}: ${err}`);
    }
  }
}