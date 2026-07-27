import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../infrastructure/database/prisma.service';
import { GeminiProvider } from './providers/gemini.provider';
import { RagService } from './rag/rag.service';
import { GenerateQuestionsDto } from './dto/ai.dto';
import { buildQuestionGenerationPrompt } from './prompts/question-generation.prompt';
import { QUEUES } from '../infrastructure/queue/queues.constants';
import { AiJobStatus, JobType, QuestionStatus } from '@prisma/client';
import { z } from 'zod';

const generatedQuestionSchema = z.object({
  questionText: z.string().min(5),
  difficulty: z.number().int().min(1).max(10),
  questionType: z.enum(['SINGLE_CORRECT', 'MULTIPLE_CORRECT', 'ASSERTION_REASON', 'INTEGER', 'MATCH_FOLLOWING', 'DIAGRAM']).default('SINGLE_CORRECT'),
  options: z.array(
    z.object({
      optionLabel: z.enum(['A', 'B', 'C', 'D']),
      optionText: z.string().min(1),
    })
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
    private geminiProvider: GeminiProvider,
    private ragService: RagService,
    @InjectQueue(QUEUES.AI_GENERATION) private aiQueue: Queue
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

    await this.aiQueue.add('generate-questions', {
      jobId: job.id,
      userId,
      dto,
    });

    return job;
  }

  async processGenerationJob(jobId: string, userId: string, dto: GenerateQuestionsDto) {
    const updateJob = async (status: AiJobStatus, progress: number, step: string, result?: any, error?: string) => {
      return this.prisma.aiJob.update({
        where: { id: jobId },
        data: { status, progress, currentStep: step, result, error },
      });
    };

    try {
      // Step 1: Input Validation & Topic lookup
      await updateJob(AiJobStatus.VALIDATING, 10, 'Validating parameters');
      const subject = await this.prisma.subject.findUnique({ where: { id: dto.subjectId } });
      const topic = dto.topicId ? await this.prisma.topic.findUnique({ where: { id: dto.topicId } }) : null;

      if (!subject) throw new Error('Invalid subjectId');

      // Step 2: Smart Fetch existing questions from bank to avoid unnecessary AI generation
      await updateJob(AiJobStatus.RETRIEVING, 25, 'Checking question bank');
      const existingCount = await this.prisma.question.count({
        where: {
          subjectId: dto.subjectId,
          topicId: dto.topicId || undefined,
          status: QuestionStatus.APPROVED,
        },
      });

      // Step 3: RAG Retrieval
      await updateJob(AiJobStatus.RETRIEVING, 40, 'Retrieving NCERT RAG context');
      let ragContext = '';
      if (topic) {
        const ragRes = await this.ragService.getContextForPrompt(topic.name, dto.subjectId, dto.topicId);
        ragContext = ragRes.contextText;
      }

      // Step 4 & 5: Prompt Builder & Gemini Call
      await updateJob(AiJobStatus.GENERATING, 60, 'Calling Gemini 1.5 Flash');
      const prompt = buildQuestionGenerationPrompt({
        subjectName: subject.name,
        topicName: topic?.name,
        difficulty: dto.difficulty,
        count: dto.count,
        ragContext,
      });

      const aiRes = await this.geminiProvider.generateContent(prompt, {
        useAdvancedModel: dto.useAdvancedModel,
      });

      // Step 6: Zod JSON Schema Validation
      await updateJob(AiJobStatus.AI_VALIDATING, 80, 'Validating JSON schema');
      const cleanJson = aiRes.text.replace(/```json|```/g, '').trim();
      const rawJson = JSON.parse(cleanJson);
      const parsedQuestions = questionsArraySchema.parse(rawJson);

      // Step 7, 8, 9 & 10: Store valid questions
      await updateJob(AiJobStatus.STORING, 90, 'Saving questions to database');
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
              create: q.options.map((opt) => ({
                optionLabel: opt.optionLabel,
                optionText: opt.optionText,
              })),
            },
          },
        });
        createdQuestionIds.push(created.id);
      }

      await updateJob(
        AiJobStatus.COMPLETED,
        100,
        'Completed',
        { questionIds: createdQuestionIds, count: createdQuestionIds.length }
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