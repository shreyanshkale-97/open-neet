export type PaperClassification = 'DIGITAL' | 'SCANNED' | 'MIXED';

export type TemplateType = 'NTA_OFFICIAL' | 'ALLEN_TEST' | 'AAKASH_FT' | 'PHYSICS_WALLAH' | 'GENERIC';

export interface PageTextData {
  pageNumber: number; // 1-based
  rawText: string;
  cleanText: string;
  hasCorruptedFonts: boolean;
  corruptedReason?: string;
  isScannedImage: boolean;
  needsOcr: boolean;
  ocrApplied?: boolean;
}

export interface ProcessingMetadata {
  parserUsed: string;
  ocrPageCount: number;
  totalPageCount: number;
  processingTimeMs: number;
  strategy: 'text' | 'vision' | 'hybrid';
  extractionVersion: string;
  timestamp: string;
}

export interface RawExtractedBlock {
  id: string;
  questionNumber: number;
  pageNumber: number;
  rawText: string;
  hasFormula: boolean;
  hasImage: boolean;
  boundingBox?: { x: number; y: number; width: number; height: number };
}

export interface PipelineQuestionOption {
  id: string;
  letter: 'A' | 'B' | 'C' | 'D';
  text: string;
}

export interface PipelineQuestion {
  id: string;
  questionNumber: number;
  questionText: string;
  options: PipelineQuestionOption[];
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption?: string; // 'A' | 'B' | 'C' | 'D'
  correctOptionIndex?: number | null;
  subject: string; // Physics | Chemistry | Botany | Zoology | General
  pageNumber: number;
  questionType: string;
  hasImage: boolean;
  imageDescription?: string;
  hasFormula: boolean;
  
  // Scoring & Validation
  parserScore: number;
  validatorScore: number;
  ocrScore: number;
  aiScore: number;
  compositeConfidence: number; // 0 - 100
  needsReview: boolean;
  reviewReasons: string[];
  
  processingMetadata: {
    parser: string;
    ocrUsed: boolean;
    visionUsed: boolean;
    processingTimeMs: number;
  };
}

export interface ProcessingDocument {
  id: string;
  jobId: string;
  filename: string;
  pdfBuffer: Buffer;
  userId: string;
  
  // Classification & Quality
  classification: PaperClassification;
  templateType: TemplateType;
  pages: PageTextData[];
  qualityMetrics: {
    corruptedPageCount: number;
    scannedPageCount: number;
    textQualityScore: number; // 0 - 100
  };
  
  // Extracted Blocks & Questions
  rawBlocks: RawExtractedBlock[];
  questions: PipelineQuestion[];
  
  // Validation & Telemetry
  structureValid: boolean;
  contentValid: boolean;
  numberingValid: boolean;
  imageValid: boolean;
  
  metadata: ProcessingMetadata;
  status: 'PENDING' | 'CLASSIFIED' | 'PARSED' | 'SPLIT' | 'VALIDATED' | 'COMPLETED' | 'FAILED';
  error?: string;
}
