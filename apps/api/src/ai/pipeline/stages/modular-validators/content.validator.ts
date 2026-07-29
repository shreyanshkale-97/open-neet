import { Injectable } from '@nestjs/common';
import { PipelineQuestion } from '../../interfaces/processing-document.interface';

@Injectable()
export class ContentValidator {
  validate(q: PipelineQuestion): { score: number; reasons: string[] } {
    const reasons: string[] = [];
    let score = 100;

    const optTexts = [q.optionA, q.optionB, q.optionC, q.optionD].map((o) => (o || '').trim().toLowerCase());
    const placeholderRe = /^option [abcd]$/i;

    if (optTexts.some((o) => placeholderRe.test(o))) {
      score -= 20;
      reasons.push('Placeholder option text detected (e.g. Option A)');
    }

    const uniqueOpts = new Set(optTexts.filter((o) => o.length > 0));
    if (uniqueOpts.size < 4 && optTexts.filter((o) => o.length > 0).length >= 2) {
      score -= 25;
      reasons.push('Duplicate option text detected');
    }

    return { score: Math.max(0, score), reasons };
  }
}
