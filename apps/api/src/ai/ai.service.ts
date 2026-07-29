import { Injectable, Inject, NotFoundException, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../infrastructure/database/prisma.service';
import { AiProvider, AI_PROVIDER_TOKEN } from './providers/ai-provider.interface';
import { RagService } from './rag/rag.service';
import { GenerateQuestionsDto } from './dto/ai.dto';
import {
  buildGeneratorUserPromptV2,
  buildGeneratorSystemPromptV2,
  GENERATOR_PROMPT_VERSION_V2,
} from './prompts/generator-v2.prompt';
import { QUEUES } from '../infrastructure/queue/queues.constants';
import { AiJobStatus, JobType, QuestionStatus } from '@prisma/client';
import { z } from 'zod';

const generatedQuestionSchema = z.object({
  questionText: z.string().min(5),
  difficulty: z.number().int().min(1).max(10),
  questionType: z.enum([
    'SINGLE_CORRECT',
    'MULTIPLE_CORRECT',
    'ASSERTION_REASON',
    'INTEGER',
    'MATCH_FOLLOWING',
    'DIAGRAM',
  ]).default('SINGLE_CORRECT'),
  options: z.array(
    z.object({
      optionLabel: z.enum(['A', 'B', 'C', 'D']),
      optionText: z.string().min(1),
    }),
  ).length(4),
  correctOption: z.enum(['A', 'B', 'C', 'D']),
  explanation: z.string().min(5),
});

const questionsArraySchema = z.array(generatedQuestionSchema);

import { DifficultyEngineService } from './services/difficulty-engine.service';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(
    private prisma: PrismaService,
    @Inject(AI_PROVIDER_TOKEN) private aiProvider: AiProvider,
    private ragService: RagService,
    private difficultyEngine: DifficultyEngineService,
    @InjectQueue(QUEUES.AI_GENERATION) private aiQueue: Queue,
  ) {}

  async createQuestionGenerationJob(dto: GenerateQuestionsDto, userId: string) {
    const job = await this.prisma.aiJob.create({
      data: {
        userId,
        jobType: JobType.QUESTION_GENERATION,
        status: AiJobStatus.QUEUED,
        progress: 0,
        currentStep: 'Job Queued',
      },
    });

    await this.aiQueue.add('generate-questions', { jobId: job.id, userId, dto });
    return job;
  }

  async processGenerationJob(jobId: string, userId: string, dto: GenerateQuestionsDto) {
    const updateJob = async (
      status: AiJobStatus,
      progress: number,
      step: string,
      result?: any,
      error?: string,
    ) =>
      this.prisma.aiJob.update({
        where: { id: jobId },
        data: { status, progress, currentStep: step, result, error },
      });

    try {
      // Step 1: Validate inputs
      await updateJob(AiJobStatus.VALIDATING, 10, 'Validating parameters');
      const subject = await this.prisma.subject.findUnique({ where: { id: dto.subjectId } });
      const topic = dto.topicId
        ? await this.prisma.topic.findUnique({ where: { id: dto.topicId } })
        : null;

      if (!subject) throw new Error('Invalid subjectId');

      // Step 2: Check question bank
      await updateJob(AiJobStatus.RETRIEVING, 25, 'Checking question bank');
      await this.prisma.question.count({
        where: {
          subjectId: dto.subjectId,
          topicId: dto.topicId || undefined,
          status: QuestionStatus.APPROVED,
        },
      });

      // Step 3: RAG retrieval
      await updateJob(AiJobStatus.RETRIEVING, 40, 'Retrieving NCERT context');
      let ragContext = '';
      if (topic) {
        const ragRes = await this.ragService.getContextForPrompt(
          topic.name,
          dto.subjectId,
          dto.topicId,
        );
        ragContext = ragRes.contextText;
      }

      // Step 4: Build prompt (versioned V2 NEET 2027) + call AI provider
      await updateJob(AiJobStatus.GENERATING, 60, `Generating with ${GENERATOR_PROMPT_VERSION_V2}`);

      const systemPrompt = buildGeneratorSystemPromptV2();
      const userPrompt = buildGeneratorUserPromptV2({
        subjectName: subject.name,
        chapterName: topic?.name,
        difficulty: dto.difficulty,
        count: dto.count,
        ragContext,
      });

      // Combine system + user prompts for providers that don't natively support system messages
      const combinedPrompt = `${systemPrompt}\n\n${userPrompt}`;

      const aiRes = await this.aiProvider.generateContent(combinedPrompt, {
        useAdvancedModel: dto.useAdvancedModel,
        temperature: 0.4,
      });

      // Step 5: Zod schema validation
      await updateJob(AiJobStatus.AI_VALIDATING, 80, 'Validating JSON schema');
      const cleanJson = aiRes.text.replace(/```json|```/g, '').trim();
      // Find array bounds (model may wrap response in text)
      const arrayStart = cleanJson.indexOf('[');
      const arrayEnd = cleanJson.lastIndexOf(']');
      const jsonStr = arrayStart >= 0 ? cleanJson.slice(arrayStart, arrayEnd + 1) : cleanJson;
      const rawJson = JSON.parse(jsonStr);
      const parsedQuestions = questionsArraySchema.parse(rawJson);

      // Step 6: Store questions
      await updateJob(AiJobStatus.STORING, 90, 'Saving to database');
      const createdQuestionIds: string[] = [];

      for (const q of parsedQuestions) {
        const created = await this.prisma.question.create({
          data: {
            subjectId: dto.subjectId,
            unitId: dto.unitId || (topic ? topic.unitId : ''),
            topicId: dto.topicId || '',
            questionText: q.questionText,
            difficulty: q.difficulty,
            questionType: q.questionType as any,
            correctOption: q.correctOption,
            explanation: q.explanation,
            source: 'AI_GENERATED',
            status: QuestionStatus.PENDING_REVIEW,
            createdBy: userId,
            options: {
              create: q.options.map(opt => ({
                optionLabel: opt.optionLabel,
                optionText: opt.optionText,
              })),
            },
          },
        });
        createdQuestionIds.push(created.id);
      }

      await updateJob(AiJobStatus.COMPLETED, 100, 'Completed', {
        questionIds: createdQuestionIds,
        count: createdQuestionIds.length,
        promptVersion: GENERATOR_PROMPT_VERSION,
        model: aiRes.model,
      });

      this.logger.log(
        `Generation job ${jobId}: ${createdQuestionIds.length} questions, ` +
        `model=${aiRes.model}, time=${aiRes.responseTimeMs}ms, ` +
        `prompt=${GENERATOR_PROMPT_VERSION}`,
      );

      return createdQuestionIds;
    } catch (err: any) {
      this.logger.warn(`AI generation job ${jobId} provider failed (${err.message}). Activating NEET Question Bank Dataset Engine...`);

      try {
        await updateJob(AiJobStatus.GENERATING, 70, 'Using NEET Question Bank Dataset Engine');
        const fallbackItems = this.difficultyEngine.selectQuestionsForBlueprint({
          subjectId: dto.subjectId,
          chapterName: topic?.name,
          targetDifficulty: dto.difficulty,
          count: dto.count,
        });

        const createdQuestionIds: string[] = [];
        for (const q of fallbackItems) {
          try {
            const created = await this.prisma.question.create({
              data: {
                subjectId: dto.subjectId,
                unitId: dto.unitId || (topic ? topic.unitId : ''),
                topicId: dto.topicId || '',
                questionText: q.questionText,
                difficulty: q.difficulty,
                questionType: (q.questionType as any) || 'SINGLE_CORRECT',
                correctOption: q.correctOption,
                explanation: q.explanation,
                imageUrl: q.hasImage ? (q.imageUrl || `/api/v1/ai/storage/diagrams/${q.id}.png`) : undefined,
                source: 'AI_GENERATED',
                status: QuestionStatus.APPROVED,
                createdBy: userId,
                options: {
                  create: q.options.map((opt) => ({
                    optionLabel: opt.optionLabel,
                    optionText: opt.optionText,
                  })),
                },
              },
            });
            createdQuestionIds.push(created.id);
          } catch (dbErr) {
            // Ignore DB uniqueness constraint errors if duplicate fallback ID
          }
        }

        await updateJob(AiJobStatus.COMPLETED, 100, 'Completed (Dataset Fallback)', {
          questionIds: createdQuestionIds,
          count: createdQuestionIds.length,
          strategy: 'NEET_QUESTION_BANK_DATASET_V2',
        });

        return createdQuestionIds;
      } catch (fallbackErr: any) {
        this.logger.error(`Generation job ${jobId} failed completely: ${fallbackErr.message}`);
        await updateJob(AiJobStatus.FAILED, 0, 'Failed', null, fallbackErr.message);
        throw fallbackErr;
      }
    }
  }

  async getJob(id: string) {
    const job = await this.prisma.aiJob.findUnique({ where: { id } });
    if (!job) throw new NotFoundException(`AiJob '${id}' not found`);
    return job;
  }
}