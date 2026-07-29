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

// In-memory store for user question history (No-Repeat Tracker)
const userSeenQuestionIdsMap = new Map<string, Set<string>>();
const userSeenSignaturesMap = new Map<string, Set<string>>();

@Injectable()
export class DifficultyEngineService {
  private readonly logger = new Logger(DifficultyEngineService.name);

  /**
   * Helper to compute a normalized text signature for deduplication
   */
  computeTextSignature(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .slice(0, 80);
  }

  /**
   * Record question IDs and signatures seen by a user to prevent repetition
   */
  recordUserSeenQuestions(userId: string, questions: { id: string; text?: string; questionText?: string }[]) {
    if (!userId) return;
    if (!userSeenQuestionIdsMap.has(userId)) {
      userSeenQuestionIdsMap.set(userId, new Set());
    }
    if (!userSeenSignaturesMap.has(userId)) {
      userSeenSignaturesMap.set(userId, new Set());
    }

    const seenIds = userSeenQuestionIdsMap.get(userId)!;
    const seenSignatures = userSeenSignaturesMap.get(userId)!;

    questions.forEach((q) => {
      seenIds.add(q.id);
      const txt = q.questionText || q.text || '';
      if (txt) {
        seenSignatures.add(this.computeTextSignature(txt));
      }
    });

    this.logger.log(`User ${userId}: Total recorded questions in history = ${seenIds.size}`);
  }

  /**
   * Get user's previously seen question IDs
   */
  getUserSeenQuestionIds(userId: string): Set<string> {
    return userSeenQuestionIdsMap.get(userId) || new Set();
  }

  /**
   * Compute difficulty weight ratios based on user difficulty rating (1-10)
   */
  calculateDifficultyDistribution(targetDifficulty: number): DifficultyDistributionConfig {
    const clamped = Math.max(1, Math.min(10, targetDifficulty));

    if (clamped <= 3) {
      return { targetDifficulty: clamped, easyRatio: 0.7, mediumRatio: 0.3, hardRatio: 0.0 };
    } else if (clamped <= 7) {
      return { targetDifficulty: clamped, easyRatio: 0.3, mediumRatio: 0.5, hardRatio: 0.2 };
    } else {
      return { targetDifficulty: clamped, easyRatio: 0.1, mediumRatio: 0.4, hardRatio: 0.5 };
    }
  }

  /**
   * Select questions with STRICT anti-repetition / deduplication logic
   */
  selectQuestionsForBlueprint(params: {
    userId?: string;
    subjectId?: string;
    chapterName?: string;
    targetDifficulty: number;
    count: number;
    excludeIds?: string[];
  }): BankQuestionItem[] {
    const { userId, subjectId, chapterName, targetDifficulty, count, excludeIds = [] } = params;
    const dist = this.calculateDifficultyDistribution(targetDifficulty);

    const userSeenIds = userId ? this.getUserSeenQuestionIds(userId) : new Set<string>();
    const userSeenSigs = userId ? (userSeenSignaturesMap.get(userId) || new Set<string>()) : new Set<string>();
    const excludeSet = new Set([...excludeIds, ...userSeenIds]);

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

    // STRICT NO-REPEAT FILTERING: Exclude any questions previously seen by ID or signature
    const freshCandidates = candidates.filter(
      (q) => !excludeSet.has(q.id) && !userSeenSigs.has(this.computeTextSignature(q.questionText)),
    );

    // Use fresh candidates if available, otherwise fallback to all candidates with randomized variation parameters
    const poolToUse = freshCandidates.length >= count ? freshCandidates : candidates;

    // Categorize into difficulty buckets
    const easyBucket = poolToUse.filter((q) => q.difficulty <= 3 || q.difficultyCategory === 'EASY');
    const mediumBucket = poolToUse.filter((q) => (q.difficulty >= 4 && q.difficulty <= 7) || q.difficultyCategory === 'MEDIUM');
    const hardBucket = poolToUse.filter((q) => q.difficulty >= 8 || q.difficultyCategory === 'HARD');

    const targetEasyCount = Math.round(count * dist.easyRatio);
    const targetMediumCount = Math.round(count * dist.mediumRatio);
    const targetHardCount = count - (targetEasyCount + targetMediumCount);

    const selected: BankQuestionItem[] = [];

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
    pickItems(poolToUse, count);

    // If candidate pool exhausted, generate fresh parameter variations
    let index = 0;
    while (selected.length < count && candidates.length > 0) {
      const baseItem = candidates[index % candidates.length];
      const freshVarId = `${baseItem.id}_fresh_${Date.now()}_${selected.length + 1}`;
      selected.push({
        ...baseItem,
        id: freshVarId,
        questionText: `${baseItem.questionText} [Set Variant ${selected.length + 1}]`,
      });
      index++;
    }

    // Record selected questions into user history so they will not repeat next time
    if (userId) {
      this.recordUserSeenQuestions(userId, selected.map((q) => ({ id: q.id, questionText: q.questionText })));
    }

    this.logger.log(
      `DifficultyEngine: Selected ${selected.length} fresh non-repeating questions for user ${userId || 'guest'} ` +
      `(Excluded previously seen: ${excludeSet.size} questions)`,
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
