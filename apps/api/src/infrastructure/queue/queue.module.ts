import { Global, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';
import { QUEUES } from './queues.constants';

@Global()
@Module({
  imports: [
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const redisUrl = config.get<string>('redis.url') ?? 'redis://localhost:6379';
        const url = new URL(redisUrl);
        return {
          connection: {
            host: url.hostname || 'localhost',
            port: parseInt(url.port || '6379', 10),
            password: url.password || undefined,
          },
        };
      },
    }),
    BullModule.registerQueue(
      { name: QUEUES.AI_GENERATION },
      { name: QUEUES.DOCUMENT_PROCESSING },
      { name: QUEUES.OCR },
      { name: QUEUES.EMBEDDINGS },
      { name: QUEUES.NOTIFICATIONS },
      { name: QUEUES.REPORTS },
      { name: QUEUES.CLEANUP },
      { name: QUEUES.ANALYTICS }
    ),
  ],
  exports: [BullModule],
})
export class AppQueueModule {}