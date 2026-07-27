import { Injectable } from '@nestjs/common';
import { ChunkingService, RawChunkInput } from './chunking.service';
import { RetrievalService } from './retrieval.service';
import { RagRepository } from './rag.repository';

@Injectable()
export class RagService {
  constructor(
    private chunkingService: ChunkingService,
    private retrievalService: RetrievalService,
    private ragRepo: RagRepository
  ) {}

  async processDocumentText(input: RawChunkInput) {
    const chunksData = this.chunkingService.chunkText(input);
    await this.ragRepo.createChunks(chunksData);
    return this.ragRepo.findChunksByDocument(input.documentId);
  }

  async getContextForPrompt(query: string, subjectId?: string, topicId?: string) {
    return this.retrievalService.retrieveContext(query, { subjectId, topicId, limit: 8 });
  }
}