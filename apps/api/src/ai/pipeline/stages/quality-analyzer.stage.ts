import { Injectable, Logger } from '@nestjs/common';
import { ProcessingDocument, PageTextData } from '../interfaces/processing-document.interface';
const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.mjs');

@Injectable()
export class QualityAnalyzerStage {
  private readonly logger = new Logger(QualityAnalyzerStage.name);

  async execute(doc: ProcessingDocument): Promise<ProcessingDocument> {
    const pdfData = new Uint8Array(doc.pdfBuffer);
    const pdfDoc = await pdfjsLib.getDocument({
      data: pdfData,
      useWorkerFetch: false,
      isEvalSupported: false,
      useSystemFonts: true,
    }).promise;

    const totalPages = pdfDoc.numPages;
    const pages: PageTextData[] = [];
    let corruptedPageCount = 0;
    let scannedPageCount = 0;

    for (let p = 1; p <= totalPages; p++) {
      const page = await pdfDoc.getPage(p);
      const textContent = await page.getTextContent();
      const rawText = textContent.items.map((i: any) => i.str).join(' ');
      const cleanText = rawText.replace(/\s+/g, ' ').trim();

      // Check for symbol font corruptions (???? artifacts, unprintable Unicode)
      const questionMarkPattern = /\?{3,}/g;
      const unprintablePattern = /[\uFFFD\u0000-\u0008\u000B\u000C\u000E-\u001F]/g;
      const isShort = cleanText.length < 50;
      
      const qmMatches = cleanText.match(questionMarkPattern) || [];
      const unprintableMatches = cleanText.match(unprintablePattern) || [];
      
      const hasCorruptedFonts = qmMatches.length > 2 || unprintableMatches.length > 3;
      const isScannedImage = isShort;
      const needsOcr = hasCorruptedFonts || isScannedImage || doc.classification === 'SCANNED';

      if (hasCorruptedFonts) corruptedPageCount++;
      if (isScannedImage) scannedPageCount++;

      let corruptedReason: string | undefined = undefined;
      if (hasCorruptedFonts) corruptedReason = 'Custom font glyph corruption (???? artifacts detected)';
      else if (isScannedImage) corruptedReason = 'Scanned image page (insufficient text stream)';

      pages.push({
        pageNumber: p,
        rawText,
        cleanText,
        hasCorruptedFonts,
        corruptedReason,
        isScannedImage,
        needsOcr,
      });
    }

    doc.pages = pages;
    const totalCorruptedOrScanned = corruptedPageCount + scannedPageCount;
    const textQualityScore = Math.max(0, Math.round(((totalPages - totalCorruptedOrScanned) / totalPages) * 100));

    doc.qualityMetrics = {
      corruptedPageCount,
      scannedPageCount,
      textQualityScore,
    };

    this.logger.log(
      `[Stage 5] Extraction Quality Analyzer: Score=${textQualityScore}% | ` +
      `Corrupted=${corruptedPageCount}/${totalPages} | Scanned=${scannedPageCount}/${totalPages}`,
    );

    return doc;
  }
}
