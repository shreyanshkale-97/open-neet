import { Injectable, Logger } from '@nestjs/common';
import { ProcessingDocument } from '../interfaces/processing-document.interface';
import { PdfProcessorService } from '../../services/pdf-processor.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ImageMatcherStage {
  private readonly logger = new Logger(ImageMatcherStage.name);

  constructor(private pdfProcessor: PdfProcessorService) {}

  async execute(doc: ProcessingDocument): Promise<ProcessingDocument> {
    const diagramsDir = path.resolve(process.cwd(), 'assets/diagrams');
    if (!fs.existsSync(diagramsDir)) {
      fs.mkdirSync(diagramsDir, { recursive: true });
    }

    let croppedCount = 0;

    // Group questions by page number to calculate relative vertical offset for exact region cropping
    const pageQuestionsMap = new Map<number, typeof doc.questions>();
    for (const q of doc.questions) {
      if (!pageQuestionsMap.has(q.pageNumber)) {
        pageQuestionsMap.set(q.pageNumber, []);
      }
      pageQuestionsMap.get(q.pageNumber)!.push(q);
    }

    for (const [pageNum, questionsOnPage] of pageQuestionsMap.entries()) {
      const totalOnPage = questionsOnPage.length;

      for (let idx = 0; idx < totalOnPage; idx++) {
        const q = questionsOnPage[idx];

        if (q.hasImage || /diagram|figure|graph|table|circuit|shown in/i.test(q.questionText)) {
          try {
            const fileName = `diagram_${doc.id}_q${q.questionNumber}.png`;
            const filePath = path.join(diagramsDir, fileName);

            // Render exact cropped question region PNG
            const pageBuffer = await this.pdfProcessor.renderQuestionRegionToPng(
              doc.pdfBuffer,
              pageNum,
              idx,
              totalOnPage,
              2.0,
            );

            if (pageBuffer) {
              fs.writeFileSync(filePath, pageBuffer);
              q.hasImage = true;
              (q as any).imageUrl = `/api/v1/ai/storage/diagrams/${fileName}`;
              (q as any).diagramUrl = `/api/v1/ai/storage/diagrams/${fileName}`;
              croppedCount++;
            }
          } catch (err: any) {
            this.logger.warn(`Could not crop diagram for Q${q.questionNumber} on page ${pageNum}: ${err.message}`);
          }
        }
      }
    }

    this.logger.log(`[Stage 11] Image Matcher: Extracted & saved ${croppedCount} high-DPI cropped diagram assets to /storage/diagrams/`);
    return doc;
  }
}
