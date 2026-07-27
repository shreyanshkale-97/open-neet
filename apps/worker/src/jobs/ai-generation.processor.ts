import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { QUEUES } from '../../../api/src/infrastructure/queue/queues.constants';
import { AiService } from '../../../api/src/ai/ai.service';

@Processor(QUEUES.AI_GENERATION)
export class AiGenerationProcessor extends WorkerHost {
  private readonly logger = new Logger(AiGenerationProcessor.name);

  constructor(private aiService: AiService) {
    super();
  }

  async process(job: Job<any>): Promise<any> {
    this.logger.log(`Processing AI Generation Job ${job.id} (AiJob: ${job.data.jobId})`);
    const { jobId, userId, dto } = job.data;
    return this.aiService.processGenerationJob(jobId, userId, dto);
  }
}