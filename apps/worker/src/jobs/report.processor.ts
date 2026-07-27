import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { QUEUES } from '../../../api/src/infrastructure/queue/queues.constants';

@Processor(QUEUES.REPORTS)
export class ReportProcessor extends WorkerHost {
  private readonly logger = new Logger(ReportProcessor.name);

  async process(job: Job<any>): Promise<any> {
    this.logger.log(`Processing Report Generation Job ${job.id}`);
    return { success: true };
  }
}