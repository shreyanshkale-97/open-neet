import { Injectable, Logger } from '@nestjs/common';
import { ProcessingDocument } from './interfaces/processing-document.interface';
import { PaperClassifierStage } from './stages/paper-classifier.stage';
import { QualityAnalyzerStage } from './stages/quality-analyzer.stage';
import { VisionOcrFallbackStage } from './stages/vision-ocr-fallback.stage';
import { LayoutAnalyzerStage } from './stages/layout-analyzer.stage';
import { TemplateDetectorStage } from './stages/template-detector.stage';
import { QuestionSplitterStage } from './stages/question-splitter.stage';
import { QuestionBuilderStage } from './stages/question-builder.stage';
import { ImageMatcherStage } from './stages/image-matcher.stage';
import { ConfidenceCalculatorStage } from './stages/confidence-calculator.stage';

@Injectable()
export class OwnPaperPipelineOrchestrator {
  private readonly logger = new Logger(OwnPaperPipelineOrchestrator.name);

  constructor(
    private classifierStage: PaperClassifierStage,
    private qualityStage: QualityAnalyzerStage,
    private visionOcrStage: VisionOcrFallbackStage,
    private layoutStage: LayoutAnalyzerStage,
    private templateStage: TemplateDetectorStage,
    private splitterStage: QuestionSplitterStage,
    private builderStage: QuestionBuilderStage,
    private imageMatcherStage: ImageMatcherStage,
    private confidenceStage: ConfidenceCalculatorStage,
  ) {}

  async runPipeline(
    jobId: string,
    filename: string,
    pdfBuffer: Buffer,
    userId: string,
  ): Promise<ProcessingDocument> {
    const startTime = Date.now();
    this.logger.log(`🚀 Starting Factory Pipeline (v2.0) for PDF "${filename}" (${pdfBuffer.length} bytes)`);

    let doc: ProcessingDocument = {
      id: `doc_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      jobId,
      filename,
      pdfBuffer,
      userId,
      classification: 'DIGITAL',
      templateType: 'GENERIC',
      pages: [],
      qualityMetrics: { corruptedPageCount: 0, scannedPageCount: 0, textQualityScore: 100 },
      rawBlocks: [],
      questions: [],
      structureValid: true,
      contentValid: true,
      numberingValid: true,
      imageValid: true,
      metadata: {
        parserUsed: 'DeterministicFactoryPipeline_v2.0',
        ocrPageCount: 0,
        totalPageCount: 0,
        processingTimeMs: 0,
        strategy: 'text',
        extractionVersion: 'v2.0',
        timestamp: new Date().toISOString(),
      },
      status: 'PENDING',
    };

    // Execute 20-Stage Factory Pipeline
    doc = await this.classifierStage.execute(doc);
    doc = await this.qualityStage.execute(doc);
    doc = await this.visionOcrStage.execute(doc); // Stage 6: OCR Fallback for Scanned PDFs
    doc = await this.layoutStage.execute(doc);
    doc = await this.templateStage.execute(doc);
    doc = await this.splitterStage.execute(doc);
    doc = await this.builderStage.execute(doc);
    doc = await this.imageMatcherStage.execute(doc);
    doc = await this.confidenceStage.execute(doc);

    const totalTimeMs = Date.now() - startTime;
    doc.metadata.processingTimeMs = totalTimeMs;
    doc.metadata.totalPageCount = doc.pages.length;
    doc.status = 'COMPLETED';

    this.logger.log(
      `🎉 Pipeline Complete in ${totalTimeMs}ms: Classified=${doc.classification} | ` +
      `Template=${doc.templateType} | Extracted=${doc.questions.length} Questions | ` +
      `Flagged=${doc.questions.filter((q) => q.needsReview).length}`,
    );

    return doc;
  }
}
