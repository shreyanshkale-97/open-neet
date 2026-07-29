import { Injectable, Logger } from '@nestjs/common';
import { z } from 'zod';

// ─── Zod Schema — shared between Own Paper and any future extractor ───────────

export const ExtractedQuestionSchema = z.object({
  question_number: z.coerce.number().int().min(1).max(500),
  question_text: z.string().min(2),
  option_a: z.any().transform((val) => String(val ?? '').trim()),
  option_b: z.any().transform((val) => String(val ?? '').trim()),
  option_c: z.any().transform((val) => String(val ?? '').trim()),
  option_d: z.any().transform((val) => String(val ?? '').trim()),
  correct_option: z.union([z.number(), z.string(), z.null(), z.undefined()]).optional().nullable(),
  has_image: z.boolean().optional().default(false),
  image_description: z.string().optional().nullable().default(''),
  page_number: z.coerce.number().int().min(1).optional().nullable(),
  question_type: z.string().optional().default('SINGLE_CORRECT'),
  extraction_confidence: z.coerce.number().min(0).max(1).optional().default(0.5),
  needs_review: z.boolean().optional().default(false),
  review_reason: z.string().optional().nullable().default(''),
});

export type RawExtractedQuestion = z.infer<typeof ExtractedQuestionSchema>;

export interface ValidatedQuestion {
  questionNumber: number;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption?: string;
  subject?: string;
  pageNumber?: number;
  questionType: string;
  extractionConfidence: number;
  needsReview: boolean;
  reviewReason?: string;
  hasImage: boolean;
  imageDescription?: string;
}

export interface ValidationReport {
  valid: ValidatedQuestion[];
  flagged: ValidatedQuestion[];
  schemaPassCount: number;
  schemaFailCount: number;
  domainFlagCount: number;
}

@Injectable()
export class QuestionValidatorService {
  private readonly logger = new Logger(QuestionValidatorService.name);

  /**
   * Full pipeline: raw JSON items → Zod schema → domain rules → report.
   * All methods are pure — no AI, no database, no network.
   */
  validate(rawItems: unknown[]): ValidationReport {
    // Step 1: Zod schema validation
    const { schemaValid, schemaFail } = this.applySchema(rawItems);

    // Step 2: Domain validation
    const seen = new Set<number>();
    const allValidated = schemaValid.map((q) => this.applyDomainRules(q, seen));

    const valid = allValidated.filter((q) => !q.needsReview);
    const flagged = allValidated.filter((q) => q.needsReview);

    this.logger.log(
      `Validation: schema OK=${schemaValid.length} fail=${schemaFail} | ` +
      `domain valid=${valid.length} flagged=${flagged.length}`,
    );

    return {
      valid,
      flagged,
      schemaPassCount: schemaValid.length,
      schemaFailCount: schemaFail,
      domainFlagCount: flagged.length,
    };
  }

  // ── Private: Zod schema validation ───────────────────────────────────────────

  private applySchema(items: unknown[]): {
    schemaValid: RawExtractedQuestion[];
    schemaFail: number;
  } {
    const schemaValid: RawExtractedQuestion[] = [];
    let schemaFail = 0;

    for (const item of items) {
      const result = ExtractedQuestionSchema.safeParse(item);
      if (result.success) {
        schemaValid.push(result.data);
      } else {
        schemaFail++;
        const issues = result.error.issues
          .map((i) => `${i.path.join('.')}: ${i.message}`)
          .join('; ');
        this.logger.debug(`Schema validation failed: ${issues}`);
      }
    }

    return { schemaValid, schemaFail };
  }

  // ── Private: Domain rules ─────────────────────────────────────────────────────

  private applyDomainRules(
    q: RawExtractedQuestion,
    seen: Set<number>,
  ): ValidatedQuestion {
    const reasons: string[] = [];

    // Carry forward any review flag from the AI model itself
    if (q.needs_review && q.review_reason) {
      reasons.push(q.review_reason);
    }

    // Duplicate question number
    if (seen.has(q.question_number)) {
      reasons.push(`Duplicate question number: ${q.question_number}`);
    } else {
      seen.add(q.question_number);
    }

    // Question text too short — sign of extraction failure
    if (!q.question_text || q.question_text.trim().length < 3) {
      reasons.push('Question text too short — likely extraction error');
    }

    // Normalize correct option ('A', 'B', 'C', 'D' or 1, 2, 3, 4)
    let optStr: string | undefined = undefined;
    if (q.correct_option !== null && q.correct_option !== undefined) {
      const val = String(q.correct_option).trim().toUpperCase();
      if (['A', 'B', 'C', 'D'].includes(val)) optStr = val;
      else if (val === '1' || val === 'OPTION_A' || val === 'OPTION A') optStr = 'A';
      else if (val === '2' || val === 'OPTION_B' || val === 'OPTION B') optStr = 'B';
      else if (val === '3' || val === 'OPTION_C' || val === 'OPTION C') optStr = 'C';
      else if (val === '4' || val === 'OPTION_D' || val === 'OPTION D') optStr = 'D';
    }

    // Low extraction confidence
    const confidence = q.extraction_confidence ?? 0.5;
    if (confidence < 0.5) {
      reasons.push(`Low extraction confidence: ${Math.round(confidence * 100)}%`);
    }

    return {
      questionNumber: q.question_number,
      questionText: q.question_text,
      optionA: q.option_a,
      optionB: q.option_b,
      optionC: q.option_c,
      optionD: q.option_d,
      correctOption: optStr,
      subject: this.inferNeetSubject(q.question_number),
      pageNumber: q.page_number ?? undefined,
      questionType: reasons.length > 0 ? 'NEEDS_REVIEW' : (q.question_type ?? 'SINGLE_CORRECT'),
      extractionConfidence: confidence,
      needsReview: reasons.length > 0,
      reviewReason: reasons.length > 0 ? reasons.join('; ') : undefined,
      hasImage: q.has_image ?? false,
      imageDescription: q.image_description ?? undefined,
    };
  }

  // ── Private: NEET 2024 subject ranges ────────────────────────────────────────

  private inferNeetSubject(qNum: number): string {
    if (qNum >= 1 && qNum <= 45) return 'Physics';
    if (qNum >= 46 && qNum <= 90) return 'Chemistry';
    if (qNum >= 91 && qNum <= 135) return 'Botany';
    if (qNum >= 136 && qNum <= 180) return 'Zoology';
    return 'General';
  }
}
