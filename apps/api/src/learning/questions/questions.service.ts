import { Injectable, NotFoundException } from '@nestjs/common';
import { QuestionsRepository } from './questions.repository';
import { CacheService } from '../../infrastructure/cache/cache.service';
import { CreateQuestionDto, UpdateQuestionDto, SearchBankDto } from './dto/question.dto';
import { QuestionStatus } from '@prisma/client';

@Injectable()
export class QuestionsService {
  private readonly subjectTreeCacheKey = 'subjects:tree';

  constructor(
    private questionsRepo: QuestionsRepository,
    private cache: CacheService
  ) {}

  async createQuestion(dto: CreateQuestionDto, userId?: string) {
    return this.questionsRepo.create(dto, userId);
  }

  async getQuestion(id: string) {
    const question = await this.questionsRepo.findById(id);
    if (!question) {
      throw new NotFoundException(`Question with ID '${id}' not found`);
    }
    return question;
  }

  async getQuestions(params: {
    subjectId?: string;
    topicId?: string;
    status?: QuestionStatus;
    page?: number;
    limit?: number;
  }) {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const { total, questions } = await this.questionsRepo.findMany({
      subjectId: params.subjectId,
      topicId: params.topicId,
      status: params.status,
      skip,
      take: limit,
    });

    return {
      questions,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async searchBank(dto: SearchBankDto) {
    return this.questionsRepo.searchBank(dto);
  }

  async updateQuestion(id: string, dto: UpdateQuestionDto, userId?: string) {
    const updated = await this.questionsRepo.updateWithVersion(id, dto, userId);
    if (!updated) {
      throw new NotFoundException(`Question with ID '${id}' not found`);
    }
    return updated;
  }

  async approveQuestion(id: string) {
    const question = await this.getQuestion(id);
    return this.questionsRepo.updateStatus(question.id, QuestionStatus.APPROVED);
  }

  async rejectQuestion(id: string) {
    const question = await this.getQuestion(id);
    return this.questionsRepo.updateStatus(question.id, QuestionStatus.REJECTED);
  }

  async deleteQuestion(id: string) {
    await this.getQuestion(id);
    return this.questionsRepo.delete(id);
  }

  async getSubjectTree() {
    const cached = await this.cache.get(this.subjectTreeCacheKey);
    if (cached) return cached;

    const tree = await this.questionsRepo.getSubjectTree();
    await this.cache.set(this.subjectTreeCacheKey, tree, 3600); // 1-hour Redis cache TTL
    return tree;
  }
}