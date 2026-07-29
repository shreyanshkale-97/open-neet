import { Injectable, Logger } from '@nestjs/common';
import { ProcessingDocument, PageTextData } from '../interfaces/processing-document.interface';
import { PdfProcessorService } from '../../services/pdf-processor.service';
import { createWorker } from 'tesseract.js';

@Injectable()
export class VisionOcrFallbackStage {
  private readonly logger = new Logger(VisionOcrFallbackStage.name);

  async execute(doc: ProcessingDocument): Promise<ProcessingDocument> {
    // Only run OCR fallback if PDF was classified as SCANNED or text quality is below 30%
    if (doc.classification !== 'SCANNED' && doc.qualityMetrics.textQualityScore > 30) {
      return doc;
    }

    this.logger.log(`[Stage 6] Vision OCR Fallback: Initializing Tesseract worker for ${doc.pages.length || 'scanned'} pages...`);

    const pageCount = doc.metadata.totalPageCount || (await this.pdfProcessor.getPageCount(doc.pdfBuffer));
    const newPages: PageTextData[] = [];
    let ocrAppliedCount = 0;

    let worker: any = null;
    try {
      worker = await createWorker('eng');
    } catch (err: any) {
      this.logger.warn(`Could not initialize Tesseract worker: ${err.message}`);
    }

    for (let p = 1; p <= pageCount; p++) {
      try {
        const pageBuffer = await this.pdfProcessor.renderPageToPngByPageNum(doc.pdfBuffer, p, 1.5);
        if (pageBuffer && worker) {
          const { data } = await worker.recognize(pageBuffer);
          const rawText = data.text || '';
          const cleanText = rawText.replace(/\r\n/g, '\n').trim();

          newPages.push({
            pageNumber: p,
            rawText,
            cleanText,
            hasCorruptedFonts: false,
            isScannedImage: true,
            needsOcr: true,
            ocrApplied: true,
          });

          ocrAppliedCount++;
        }
      } catch (err: any) {
        this.logger.warn(`OCR failed for page ${p}: ${err.message}`);
      }
    }

    if (worker) {
      await worker.terminate().catch(() => {});
    }

    if (newPages.length > 0) {
      doc.pages = newPages;
      doc.metadata.ocrPageCount = ocrAppliedCount;
      this.logger.log(`[Stage 6] Vision OCR Fallback Complete: Extracted text from ${ocrAppliedCount}/${pageCount} scanned pages`);
    }

    return doc;
  }

  constructor(private pdfProcessor: PdfProcessorService) {}
}
