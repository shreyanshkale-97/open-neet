import { Injectable } from '@nestjs/common';

export interface RawChunkInput {
  documentId: string;
  fullText: string;
  subjectId?: string;
  unitId?: string;
  topicId?: string;
  source?: string;
}

@Injectable()
export class ChunkingService {
  chunkText(input: RawChunkInput, chunkSize = 500, overlap = 50) {
    const words = input.fullText.split(/\s+/);
    const chunks = [];
    let position = 0;

    for (let i = 0; i < words.length; i += chunkSize - overlap) {
      const chunkWords = words.slice(i, i + chunkSize);
      const text = chunkWords.join(' ').trim();

      if (text.length > 0) {
        chunks.push({
          documentId: input.documentId,
          chunkText: text,
          chunkPosition: position++,
          tokenCount: Math.ceil(text.length / 4),
          subjectId: input.subjectId,
          unitId: input.unitId,
          topicId: input.topicId,
          source: input.source || 'user_notes',
          difficulty: 5,
        });
      }
    }

    return chunks;
  }
}