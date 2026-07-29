import { Injectable, Logger } from '@nestjs/common';
import {
  NEET_QUESTION_BANK_DATASET,
  BankQuestionItem,
} from '../datasets/neet-question-bank.dataset';

export interface DifficultyDistributionConfig {
  targetDifficulty: number; // 1 - 10
  easyRatio: number;        // e.g. 0.3 (30%)
  mediumRatio: number;      // e.g. 0.5 (50%)
  hardRatio: number;        // e.g. 0.2 (20%)
}

export interface SectionBlueprint {
  sectionAName: string;
  sectionAQuestionCount: number; // 35 compulsory
  sectionBName: string;
  sectionBQuestionCount: number; // 15 optional (attempt 10)
  totalQuestions: number;
}

@Injectable()
export class DifficultyEngineService {
  private readonly logger = new Logger(DifficultyEngineService.name);

  /**
   * Compute difficulty weight ratios based on user difficulty rating (1-10)
   */
  calculateDifficultyDistribution(targetDifficulty: number): DifficultyDistributionConfig {
    const clamped = Math.max(1, Math.min(10, targetDifficulty));

    if (clamped <= 3) {
      // Easy Focused
      return {
        targetDifficulty: clamped,
        easyRatio: 0.7,
        mediumRatio: 0.3,
        hardRatio: 0.0,
      };
    } else if (clamped <= 7) {
      // Standard NEET Exam Curve
      return {
        targetDifficulty: clamped,
        easyRatio: 0.3,
        mediumRatio: 0.5,
        hardRatio: 0.2,
      };
    } else {
      // High Difficulty / Rank Predictor Curve
      return {
        targetDifficulty: clamped,
        easyRatio: 0.1,
        mediumRatio: 0.4,
        hardRatio: 0.5,
      };
    }
  }

  /**
   * Filter and balance questions from local bank dataset by subject, difficulty, and question count
   */
  selectQuestionsForBlueprint(params: {
    subjectId?: string;
    chapterName?: string;
    targetDifficulty: number;
    count: number;
  }): BankQuestionItem[] {
    const { subjectId, chapterName, targetDifficulty, count } = params;
    const dist = this.calculateDifficultyDistribution(targetDifficulty);

    let candidates = NEET_QUESTION_BANK_DATASET;

    // Filter by subject
    if (subjectId && subjectId !== 'all') {
      const normalizedSub = subjectId.toLowerCase();
      candidates = candidates.filter((q) => q.subjectId.toLowerCase() === normalizedSub);
    }

    // Filter by chapter if specified
    if (chapterName && chapterName.trim().length > 0) {
      const normChapter = chapterName.toLowerCase().trim();
      const filteredByChapter = candidates.filter(
        (q) =>
          q.chapterName.toLowerCase().includes(normChapter) ||
          q.unitName.toLowerCase().includes(normChapter),
      );
      if (filteredByChapter.length > 0) {
        candidates = filteredByChapter;
      }
    }

    // Categorize into difficulty buckets
    const easyBucket = candidates.filter((q) => q.difficulty <= 3 || q.difficultyCategory === 'EASY');
    const mediumBucket = candidates.filter((q) => (q.difficulty >= 4 && q.difficulty <= 7) || q.difficultyCategory === 'MEDIUM');
    const hardBucket = candidates.filter((q) => q.difficulty >= 8 || q.difficultyCategory === 'HARD');

    const targetEasyCount = Math.round(count * dist.easyRatio);
    const targetMediumCount = Math.round(count * dist.mediumRatio);
    const targetHardCount = count - (targetEasyCount + targetMediumCount);

    const selected: BankQuestionItem[] = [];

    // Helper to pick items with shuffle fallback
    const pickItems = (bucket: BankQuestionItem[], needed: number) => {
      const shuffled = [...bucket].sort(() => 0.5 - Math.random());
      for (const item of shuffled) {
        if (selected.length < count && !selected.some((s) => s.id === item.id)) {
          selected.push(item);
        }
      }
    };

    pickItems(mediumBucket, targetMediumCount);
    pickItems(easyBucket, targetEasyCount);
    pickItems(hardBucket, targetHardCount);
    pickItems(candidates, count); // Fallback to reach target count

    // If still less than count, duplicate/cycle items with unique IDs
    let index = 0;
    while (selected.length < count && candidates.length > 0) {
      const baseItem = candidates[index % candidates.length];
      selected.push({
        ...baseItem,
        id: `${baseItem.id}_var_${selected.length + 1}`,
      });
      index++;
    }

    this.logger.log(
      `DifficultyEngine: Selected ${selected.length} questions for target difficulty ${targetDifficulty}/10 ` +
      `(Dist: Easy ${dist.easyRatio * 100}%, Med ${dist.mediumRatio * 100}%, Hard ${dist.hardRatio * 100}%)`,
    );

    return selected.slice(0, count);
  }

  /**
   * Structure questions into NEET Section A & Section B blueprint
   */
  buildNeetSectionBlueprint(questions: BankQuestionItem[]): {
    sectionA: BankQuestionItem[];
    sectionB: BankQuestionItem[];
  } {
    const sectionA = questions.slice(0, Math.min(35, questions.length));
    const sectionB = questions.slice(Math.min(35, questions.length));

    return { sectionA, sectionB };
  }
}
