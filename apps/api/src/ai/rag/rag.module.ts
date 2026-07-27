import { Module } from '@nestjs/common';
import { RagService } from './rag.service';
import { ChunkingService } from './chunking.service';
import { RetrievalService } from './retrieval.service';
import { RagRepository } from './rag.repository';
import { GeminiProvider } from '../providers/gemini.provider';

@Module({
  providers: [RagService, ChunkingService, RetrievalService, RagRepository, GeminiProvider],
  exports: [RagService, ChunkingService, RetrievalService],
})
export class RagModule {}