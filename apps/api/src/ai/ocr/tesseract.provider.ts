import { Injectable, Logger } from '@nestjs/common';
import { createWorker } from 'tesseract.js';
import { OcrProvider, OcrResult } from './ocr-provider.interface';

@Injectable()
export class TesseractOcrProvider implements OcrProvider {
  private readonly logger = new Logger(TesseractOcrProvider.name);

  async extractText(filePath: string): Promise<OcrResult> {
    try {
      this.logger.log(`Starting Tesseract OCR processing for: ${filePath}`);
      const worker = await createWorker('eng');
      const ret = await worker.recognize(filePath);
      await worker.terminate();

      const lines = ret.data.text.split('\n').filter((l) => l.trim().length > 0);

      return {
        text: ret.data.text,
        confidence: ret.data.confidence,
        linesCount: lines.length,
      };
    } catch (err) {
      this.logger.error(`OCR processing failed for ${filePath}: ${err}`);
      return {
        text: '',
        confidence: 0,
        linesCount: 0,
      };
    }
  }
}