import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { QUEUES } from '../../../api/src/infrastructure/queue/queues.constants';

@Processor(QUEUES.CLEANUP)
export class CleanupProcessor extends WorkerHost {
  private readonly logger = new Logger(CleanupProcessor.name);

  async process(job: Job<any>): Promise<any> {
    this.logger.log(`Processing Nightly Cleanup Job ${job.id}`);
    return { success: true };
  }
}