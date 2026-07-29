import { Injectable, Inject } from '@nestjs/common';
import { RagRepository } from './rag.repository';
import { AiProvider, AI_PROVIDER_TOKEN } from '../providers/ai-provider.interface';

@Injectable()
export class RetrievalService {
  constructor(
    private ragRepo: RagRepository,
    @Inject(AI_PROVIDER_TOKEN) private aiProvider: AiProvider
  ) {}

  async retrieveContext(queryText: string, params: { subjectId?: string; topicId?: string; limit?: number }) {
    // 1. Generate embedding vector for query
    const queryEmbedding = await this.aiProvider.generateEmbedding(queryText);

    // 2. Fetch chunks with metadata filtering
    const chunks = await this.ragRepo.searchRelevantChunks({
      subjectId: params.subjectId,
      topicId: params.topicId,
      limit: params.limit || 10,
    });

    return {
      queryEmbedding,
      chunks,
      contextText: chunks.map((c) => c.chunkText).join('\n---\n'),
    };
  }
}