import { Module, forwardRef } from '@nestjs/common';
import { RagService } from './rag.service';
import { ChunkingService } from './chunking.service';
import { RetrievalService } from './retrieval.service';
import { RagRepository } from './rag.repository';
import { AiModule } from '../ai.module';

@Module({
  imports: [forwardRef(() => AiModule)],
  providers: [RagService, ChunkingService, RetrievalService, RagRepository],
  exports: [RagService, ChunkingService, RetrievalService],
})
export class RagModule {}