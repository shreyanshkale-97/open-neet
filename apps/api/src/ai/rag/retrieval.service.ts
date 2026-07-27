import { Injectable } from '@nestjs/common';
import { RagRepository } from './rag.repository';
import { GeminiProvider } from '../providers/gemini.provider';

@Injectable()
export class RetrievalService {
  constructor(
    private ragRepo: RagRepository,
    private geminiProvider: GeminiProvider
  ) {}

  async retrieveContext(queryText: string, params: { subjectId?: string; topicId?: string; limit?: number }) {
    // 1. Generate embedding vector for query
    const queryEmbedding = await this.geminiProvider.generateEmbedding(queryText);

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