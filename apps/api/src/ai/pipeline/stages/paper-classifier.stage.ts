import { Injectable, Logger } from '@nestjs/common';
import { ProcessingDocument, PaperClassification } from '../interfaces/processing-document.interface';
const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.mjs');

@Injectable()
export class PaperClassifierStage {
  private readonly logger = new Logger(PaperClassifierStage.name);

  async execute(doc: ProcessingDocument): Promise<ProcessingDocument> {
    const pdfData = new Uint8Array(doc.pdfBuffer);
    const pdfDoc = await pdfjsLib.getDocument({
      data: pdfData,
      useWorkerFetch: false,
      isEvalSupported: false,
      useSystemFonts: true,
    }).promise;

    const totalPages = pdfDoc.numPages;
    let pagesWithText = 0;
    let pagesWithLowText = 0;

    const sampleCount = Math.min(5, totalPages);
    for (let p = 1; p <= sampleCount; p++) {
      const page = await pdfDoc.getPage(p);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((i: any) => i.str).join(' ');
      const len = pageText.trim().length;

      if (len > 150) {
        pagesWithText++;
      } else {
        pagesWithLowText++;
      }
    }

    let classification: PaperClassification = 'DIGITAL';
    if (pagesWithText === sampleCount) {
      classification = 'DIGITAL';
    } else if (pagesWithLowText === sampleCount) {
      classification = 'SCANNED';
    } else {
      classification = 'MIXED';
    }

    doc.classification = classification;
    this.logger.log(`[Stage 3] Paper Classifier: ${classification} (${pagesWithText}/${sampleCount} digital sample pages)`);
    return doc;
  }
}
