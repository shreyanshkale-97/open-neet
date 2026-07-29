import { Injectable, Logger } from '@nestjs/common';
import { ProcessingDocument } from '../interfaces/processing-document.interface';

@Injectable()
export class LayoutAnalyzerStage {
  private readonly logger = new Logger(LayoutAnalyzerStage.name);

  async execute(doc: ProcessingDocument): Promise<ProcessingDocument> {
    const headerFooterRegexes = [
      /NEET\s*\(UG\)\s*[-–]\s*\d{4}/gi,
      /Booklet\s*Code\s*[-–:]?\s*[A-Z0-9]+/gi,
      /Page\s*\d+\s*of\s*\d+/gi,
      /^\s*\d+\s*$/gm, // Standalone page numbers
      /Test\s*Booklet\s*Code/gi,
      /NATIONAL\s*ELIGIBILITY\s*CUM\s*ENTRANCE\s*TEST/gi,
    ];

    let strippedCount = 0;
    for (const p of doc.pages) {
      let text = p.cleanText;
      for (const re of headerFooterRegexes) {
        if (re.test(text)) {
          strippedCount++;
          text = text.replace(re, ' ');
        }
      }
      p.cleanText = text.replace(/\s+/g, ' ').trim();
    }

    this.logger.log(`[Stage 7] Layout Analyzer: Suppressed background headers & footers across ${doc.pages.length} pages (${strippedCount} patterns stripped)`);
    return doc;
  }
}
