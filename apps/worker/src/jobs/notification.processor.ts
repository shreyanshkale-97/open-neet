import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { QUEUES } from '../../../api/src/infrastructure/queue/queues.constants';

@Processor(QUEUES.NOTIFICATIONS)
export class NotificationProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationProcessor.name);

  async process(job: Job<any>): Promise<any> {
    this.logger.log(`Processing Notification Job ${job.id}`);
    return { success: true };
  }
}