import { Injectable } from '@nestjs/common';
import { PipelineQuestion } from '../../interfaces/processing-document.interface';

@Injectable()
export class NumberValidator {
  validate(questions: PipelineQuestion[]): Map<string, { score: number; reasons: string[] }> {
    const results = new Map<string, { score: number; reasons: string[] }>();
    const seenNumbers = new Set<number>();

    for (const q of questions) {
      const reasons: string[] = [];
      let score = 100;

      if (seenNumbers.has(q.questionNumber)) {
        score -= 50;
        reasons.push(`Duplicate question number: Q${q.questionNumber}`);
      } else {
        seenNumbers.add(q.questionNumber);
      }

      results.set(q.id, { score: Math.max(0, score), reasons });
    }

    return results;
  }
}
