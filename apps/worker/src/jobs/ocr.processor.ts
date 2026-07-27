import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { QUEUES } from '../../../api/src/infrastructure/queue/queues.constants';

@Processor(QUEUES.OCR)
export class OcrProcessor extends WorkerHost {
  private readonly logger = new Logger(OcrProcessor.name);

  async process(job: Job<any>): Promise<any> {
    this.logger.log(`Processing OCR Job ${job.id}`);
    return { success: true };
  }
}