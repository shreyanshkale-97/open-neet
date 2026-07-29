import { Injectable } from '@nestjs/common';
import { PipelineQuestion } from '../../interfaces/processing-document.interface';

@Injectable()
export class StructureValidator {
  validate(q: PipelineQuestion): { score: number; reasons: string[] } {
    const reasons: string[] = [];
    let score = 100;

    if (!q.options || q.options.length !== 4) {
      score -= 30;
      reasons.push(`Invalid options count: expected 4, got ${q.options?.length || 0}`);
    }

    if (!q.questionText || q.questionText.trim().length < 5) {
      score -= 40;
      reasons.push('Question text is empty or too short');
    }

    return { score: Math.max(0, score), reasons };
  }
}
