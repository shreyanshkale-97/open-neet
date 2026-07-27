import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { QUEUES } from '../../../api/src/infrastructure/queue/queues.constants';

@Processor(QUEUES.DOCUMENT_PROCESSING)
export class DocumentProcessingProcessor extends WorkerHost {
  private readonly logger = new Logger(DocumentProcessingProcessor.name);

  async process(job: Job<any>): Promise<any> {
    this.logger.log(`Processing Document Processing Job ${job.id} for Document ${job.data.documentId}`);
    return { success: true, documentId: job.data.documentId };
  }
}