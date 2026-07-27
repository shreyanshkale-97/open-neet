import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { CacheService } from './cache.service';

const redisProvider = {
  provide: 'REDIS_CLIENT',
  useFactory: (configService: ConfigService) => {
    const host = configService.get<string>('REDIS_HOST') || 'localhost';
    const port = configService.get<number>('REDIS_PORT') || 6379;
    const password = configService.get<string>('REDIS_PASSWORD');
    
    return new Redis({
      host,
      port,
      password: password || undefined,
      lazyConnect: true,
      maxRetriesPerRequest: null,
      enableOfflineQueue: false,
    });
  },
  inject: [ConfigService],
};

@Global()
@Module({
  providers: [redisProvider, CacheService],
  exports: ['REDIS_CLIENT', CacheService],
})
export class CacheModule {}