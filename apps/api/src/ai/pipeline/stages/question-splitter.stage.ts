import { Injectable, Logger } from '@nestjs/common';
import { ProcessingDocument, RawExtractedBlock } from '../interfaces/processing-document.interface';

@Injectable()
export class QuestionSplitterStage {
  private readonly logger = new Logger(QuestionSplitterStage.name);

  async execute(doc: ProcessingDocument): Promise<ProcessingDocument> {
    const blocks: RawExtractedBlock[] = [];

    // Precise Question Header Regex:
    // Pattern A: Q1 | Q.1 | Q-1 | Q1. | Question 1 | Que 1 (Q prefix, period optional)
    // Pattern B: 1. | 2. | 3. | 1: | 2: (Plain number, period/colon required)
    const questionRegex = /(?:^|\n|\s+)(?:(?:Question|Que\.|Que|Q\.|Q|Q-)\s*(\d{1,3})[\.\:]?|(\d{1,3})[\.\:])[\s\t]+([\s\S]*?)(?=(?:\s+)(?:(?:Question|Que\.|Que|Q\.|Q|Q-)\s*(\d{1,3})[\.\:]?|(\d{1,3})[\.\:])[\s\t]+|$)/gi;

    for (const page of doc.pages) {
      let text = page.cleanText;

      // Skip Cover / Instruction pages (e.g. Page 1 containing general instructions)
      const isCoverPage = /important instructions|candidate name|roll no|test booklet code|read the following instructions|in section b, a candidate needs to attempt/i.test(text);
      if (isCoverPage && page.pageNumber === 1) {
        this.logger.log(`[Stage 9] Skipping Cover/Instruction Page ${page.pageNumber}`);
        continue;
      }

      text = text.replace(/-\s*\d+\s*-/g, ' ');
      text = text.replace(/NEET\s*\(UG\)[^\n]*/gi, ' ');
      text = text.replace(/SECTION-[AB]/gi, ' ');
      text = text.replace(/PHYSICS|CHEMISTRY|BOTANY|ZOOLOGY/gi, ' ');

      let match: RegExpExecArray | null;
      while ((match = questionRegex.exec(text)) !== null) {
        const qNumStr = match[1] || match[2];
        const qNum = parseInt(qNumStr, 10);
        const blockContent = match[3].trim();

        if (qNum >= 1 && qNum <= 200 && blockContent.length > 10) {
          const hasFormula = /[√∫±≠≈≡α-ωA-Z̄]|\?{2,}/.test(blockContent);
          const hasImage = /diagram|figure|graph|table|circuit|shown/i.test(blockContent);

          blocks.push({
            id: `blk_p${page.pageNumber}_q${qNum}`,
            questionNumber: qNum,
            pageNumber: page.pageNumber,
            rawText: `${qNum}. ${blockContent}`,
            hasFormula,
            hasImage,
          });
        }
      }
    }

    // Deduplicate by question number, retaining the longest raw text block
    const uniqueMap = new Map<number, RawExtractedBlock>();
    for (const block of blocks) {
      if (!uniqueMap.has(block.questionNumber) || block.rawText.length > uniqueMap.get(block.questionNumber)!.rawText.length) {
        uniqueMap.set(block.questionNumber, block);
      }
    }

    const sortedBlocks = Array.from(uniqueMap.values()).sort((a, b) => a.questionNumber - b.questionNumber);
    doc.rawBlocks = sortedBlocks;

    this.logger.log(`[Stage 9] Question Splitter: Isolated ${sortedBlocks.length} unique questions (Q${sortedBlocks[0]?.questionNumber || 1} to Q${sortedBlocks[sortedBlocks.length - 1]?.questionNumber || 200})`);
    return doc;
  }
}
