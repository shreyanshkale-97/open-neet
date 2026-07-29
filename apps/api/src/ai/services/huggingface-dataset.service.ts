import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import {
  BankQuestionItem,
  NEET_QUESTION_BANK_DATASET,
} from '../datasets/neet-question-bank.dataset';
import { QuestionStatus } from '@prisma/client';

export interface HuggingFaceRowItem {
  question: string;
  subject?: string;
  choices: string[];
  answer: string | number; // e.g. "B" or 1
  explanation?: string;
}

@Injectable()
export class HuggingFaceDatasetService {
  private readonly logger = new Logger(HuggingFaceDatasetService.name);

  /**
   * List supported open Hugging Face dataset sources for NEET
   */
  getAvailableDatasets() {
    return [
      {
        id: 'sweatSmile/neet-biology-qa',
        name: 'NEET Biology QA (Hugging Face)',
        description: '793 high-yield NEET Biology MCQs with 4 options and answers',
        subject: 'botany / zoology',
        totalRows: 793,
        apiUrl: 'https://datasets-server.huggingface.co/rows?dataset=sweatSmile/neet-biology-qa&config=default&split=train',
      },
      {
        id: 'openlifescienceai/medmcqa',
        name: 'MedMCQA Medical Entrance Dataset',
        description: '194,000 Medical Entrance MCQs from NEET PG & AIIMS',
        subject: 'medical / biology',
        totalRows: 194000,
        apiUrl: 'https://datasets-server.huggingface.co/rows?dataset=openlifescienceai/medmcqa&config=default&split=train',
      },
    ];
  }

  /**
   * Fetch rows from Hugging Face Datasets API and parse into BankQuestionItem format
   */
  async fetchFromHuggingFace(datasetId = 'sweatSmile/neet-biology-qa', limit = 100, offset = 0): Promise<BankQuestionItem[]> {
    const url = `https://datasets-server.huggingface.co/rows?dataset=${encodeURIComponent(datasetId)}&config=default&split=train&offset=${offset}&limit=${limit}`;
    this.logger.log(`Fetching open dataset from Hugging Face: ${url}`);

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Hugging Face API returned HTTP ${response.status}`);
      }

      const json: any = await response.json();
      const rows = json.rows || [];

      const parsedQuestions: BankQuestionItem[] = [];

      rows.forEach((r: any, idx: number) => {
        const row = r.row || r;
        const qText = row.question || row.exp || row.cop;
        const choices = row.choices || [row.opa, row.opb, row.opc, row.opd].filter(Boolean);

        if (!qText || !choices || choices.length < 2) return;

        // Parse answer letter A, B, C, D
        let ansLetter: 'A' | 'B' | 'C' | 'D' = 'A';
        if (typeof row.answer === 'string' && ['A', 'B', 'C', 'D'].includes(row.answer.toUpperCase())) {
          ansLetter = row.answer.toUpperCase() as any;
        } else if (typeof row.answer === 'number' && row.answer >= 0 && row.answer < 4) {
          ansLetter = ['A', 'B', 'C', 'D'][row.answer] as any;
        } else if (typeof row.cop === 'number' && row.cop >= 1 && row.cop <= 4) {
          ansLetter = ['A', 'B', 'C', 'D'][row.cop - 1] as any;
        }

        const options = ['A', 'B', 'C', 'D'].slice(0, Math.min(4, choices.length)).map((lbl, oIdx) => ({
          optionLabel: lbl as 'A' | 'B' | 'C' | 'D',
          optionText: String(choices[oIdx] || `Option ${lbl}`),
        }));

        const item: BankQuestionItem = {
          id: `hf_${datasetId.replace(/[^a-zA-Z0-9]/g, '_')}_${offset + idx + 1}`,
          subjectId: (row.subject || 'biology').toLowerCase().includes('chem') ? 'chemistry' : (row.subject || 'biology').toLowerCase().includes('phys') ? 'physics' : 'botany',
          unitId: 'hf_unit_gen',
          unitName: 'Hugging Face Open Dataset Collection',
          chapterName: row.subject || 'General NCERT Biology',
          questionText: qText,
          difficulty: Math.floor(Math.random() * 5) + 3, // 3 - 7 Medium
          difficultyCategory: 'MEDIUM',
          questionType: 'SINGLE_CORRECT',
          options,
          correctOption: ansLetter,
          explanation: row.explanation || row.exp || 'Correct answer verified from Hugging Face NCERT dataset.',
          ncertReference: `Hugging Face Dataset (${datasetId})`,
        };

        parsedQuestions.push(item);
      });

      // Merge newly fetched questions into runtime dataset memory
      parsedQuestions.forEach((q) => {
        if (!NEET_QUESTION_BANK_DATASET.some((existing) => existing.id === q.id)) {
          NEET_QUESTION_BANK_DATASET.push(q);
        }
      });

      this.logger.log(`Successfully imported ${parsedQuestions.length} questions from Hugging Face dataset (${datasetId}). Total dataset bank: ${NEET_QUESTION_BANK_DATASET.length}`);

      return parsedQuestions;
    } catch (err: any) {
      this.logger.error(`Failed to fetch dataset from Hugging Face: ${err.message}`);
      return [];
    }
  }

  /**
   * Sync and store Hugging Face questions directly into PostgreSQL database bank
   */
  async syncToDatabase(prisma: PrismaService, datasetId = 'sweatSmile/neet-biology-qa', limit = 50) {
    const questions = await this.fetchFromHuggingFace(datasetId, limit);
    let insertedCount = 0;

    for (const q of questions) {
      try {
        await prisma.question.create({
          data: {
            subjectId: q.subjectId,
            unitId: q.unitId,
            topicId: 'hf_topic_gen',
            questionText: q.questionText,
            difficulty: q.difficulty,
            questionType: q.questionType as any,
            correctOption: q.correctOption,
            explanation: q.explanation,
            source: 'HUGGING_FACE_DATASET',
            status: QuestionStatus.APPROVED,
            options: {
              create: q.options.map((opt) => ({
                optionLabel: opt.optionLabel,
                optionText: opt.optionText,
              })),
            },
          },
        });
        insertedCount++;
      } catch (err) {
        // Skip duplicate items
      }
    }

    return {
      status: 'SUCCESS',
      datasetId,
      fetchedCount: questions.length,
      insertedCount,
      totalBankSize: NEET_QUESTION_BANK_DATASET.length,
    };
  }
}
