import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { QUEUES } from '../../../api/src/infrastructure/queue/queues.constants';

@Processor(QUEUES.EMBEDDINGS)
export class EmbeddingProcessor extends WorkerHost {
  private readonly logger = new Logger(EmbeddingProcessor.name);

  async process(job: Job<any>): Promise<any> {
    this.logger.log(`Processing Embedding Job ${job.id}`);
    return { success: true };
  }
}