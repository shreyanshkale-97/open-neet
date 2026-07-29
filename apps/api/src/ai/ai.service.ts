import { Injectable, Inject, NotFoundException, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../infrastructure/database/prisma.service';
import { AiProvider, AI_PROVIDER_TOKEN } from './providers/ai-provider.interface';
import { RagService } from './rag/rag.service';
import { GenerateQuestionsDto } from './dto/ai.dto';
import {
  buildGeneratorUserPrompt,
  buildGeneratorSystemPrompt,
  GENERATOR_PROMPT_VERSION,
} from './prompts/generator-v1.prompt';
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

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(
    private prisma: PrismaService,
    @Inject(AI_PROVIDER_TOKEN) private aiProvider: AiProvider,
    private ragService: RagService,
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

      // Step 4: Build prompt (versioned) + call AI provider
      await updateJob(AiJobStatus.GENERATING, 60, `Generating with ${GENERATOR_PROMPT_VERSION}`);

      const systemPrompt = buildGeneratorSystemPrompt();
      const userPrompt = buildGeneratorUserPrompt({
        subjectName: subject.name,
        topicName: topic?.name,
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
      this.logger.error(`Generation job ${jobId} failed: ${err.message}`);
      await updateJob(AiJobStatus.FAILED, 0, 'Failed', null, err.message);
      throw err;
    }
  }

  async getJob(id: string) {
    const job = await this.prisma.aiJob.findUnique({ where: { id } });
    if (!job) throw new NotFoundException(`AiJob '${id}' not found`);
    return job;
  }
}