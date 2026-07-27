import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';

@Injectable()
export class RagRepository {
  constructor(private prisma: PrismaService) {}

  async createChunks(chunksData: Array<{
    documentId: string;
    chunkText: string;
    chunkPosition: number;
    tokenCount: number;
    subjectId?: string;
    unitId?: string;
    topicId?: string;
    difficulty?: number;
    source?: string;
    pageNumber?: number;
  }>) {
    return this.prisma.chunk.createMany({
      data: chunksData,
    });
  }

  async findChunksByDocument(documentId: string) {
    return this.prisma.chunk.findMany({
      where: { documentId },
      orderBy: { chunkPosition: 'asc' },
      include: { embedding: true },
    });
  }

  async searchRelevantChunks(params: {
    subjectId?: string;
    topicId?: string;
    limit?: number;
  }) {
    const where: any = {};
    if (params.subjectId) where.subjectId = params.subjectId;
    if (params.topicId) where.topicId = params.topicId;

    return this.prisma.chunk.findMany({
      where,
      take: params.limit || 10,
      orderBy: { createdAt: 'desc' },
    });
  }
}