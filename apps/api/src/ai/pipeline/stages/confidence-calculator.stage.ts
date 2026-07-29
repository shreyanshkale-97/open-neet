import { Injectable, Logger } from '@nestjs/common';
import { ProcessingDocument } from '../interfaces/processing-document.interface';
import { StructureValidator } from './modular-validators/structure.validator';
import { ContentValidator } from './modular-validators/content.validator';
import { NumberValidator } from './modular-validators/number.validator';

@Injectable()
export class ConfidenceCalculatorStage {
  private readonly logger = new Logger(ConfidenceCalculatorStage.name);

  constructor(
    private structureValidator: StructureValidator,
    private contentValidator: ContentValidator,
    private numberValidator: NumberValidator,
  ) {}

  async execute(doc: ProcessingDocument): Promise<ProcessingDocument> {
    const numResults = this.numberValidator.validate(doc.questions);
    let flaggedCount = 0;

    for (const q of doc.questions) {
      const structRes = this.structureValidator.validate(q);
      const contentRes = this.contentValidator.validate(q);
      const numRes = numResults.get(q.id) || { score: 100, reasons: [] };

      // Combined validator score
      const validatorScore = Math.round((structRes.score + contentRes.score + numRes.score) / 3);
      q.validatorScore = validatorScore;

      // Mathematical weighted score
      const parser = q.parserScore ?? 95;
      const val = q.validatorScore ?? 100;
      const ocr = q.ocrScore ?? 100;
      const ai = q.aiScore ?? 95;

      const composite = Math.round((0.35 * parser) + (0.35 * val) + (0.15 * ocr) + (0.15 * ai));
      q.compositeConfidence = Math.min(100, Math.max(0, composite));

      const allReasons = [
        ...structRes.reasons,
        ...contentRes.reasons,
        ...numRes.reasons,
      ];

      q.reviewReasons = allReasons;
      if (q.compositeConfidence < 90 || allReasons.length > 0) {
        q.needsReview = true;
        flaggedCount++;
      } else {
        q.needsReview = false;
      }
    }

    this.logger.log(
      `[Stage 16 & 17] Confidence Calculator & Review Decision: Calculated weighted confidence for ${doc.questions.length} questions | ` +
      `Flagged for Review (<90% or warnings)=${flaggedCount}/${doc.questions.length}`,
    );

    return doc;
  }
}
