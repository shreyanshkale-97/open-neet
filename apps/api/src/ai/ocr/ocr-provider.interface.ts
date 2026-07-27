export interface OcrResult {
  text: string;
  confidence: number;
  linesCount: number;
}

export interface OcrProvider {
  extractText(filePath: string): Promise<OcrResult>;
}

export const OCR_PROVIDER_TOKEN = 'OCR_PROVIDER';