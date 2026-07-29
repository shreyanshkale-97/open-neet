import { Module, forwardRef } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { OwnPaperController } from './own-paper.controller';
import { OwnPaperService } from './own-paper.service';
import { GeminiProvider } from './providers/gemini.provider';
import { OllamaProvider } from './providers/ollama.provider';
import { AiProviderFactory } from './factory/ai-provider.factory';
import { AI_PROVIDER_TOKEN } from './providers/ai-provider.interface';
import { PdfProcessorService } from './services/pdf-processor.service';
import { QuestionValidatorService } from './services/question-validator.service';
import { AiHealthController } from './health/ai-health.controller';
import { RagModule } from './rag/rag.module';
import { AiCostInterceptor } from './interceptors/ai-cost.interceptor';

// Pipeline Stages & Orchestrator
import { PaperClassifierStage } from './pipeline/stages/paper-classifier.stage';
import { QualityAnalyzerStage } from './pipeline/stages/quality-analyzer.stage';
import { VisionOcrFallbackStage } from './pipeline/stages/vision-ocr-fallback.stage';
import { LayoutAnalyzerStage } from './pipeline/stages/layout-analyzer.stage';
import { TemplateDetectorStage } from './pipeline/stages/template-detector.stage';
import { QuestionSplitterStage } from './pipeline/stages/question-splitter.stage';
import { QuestionBuilderStage } from './pipeline/stages/question-builder.stage';
import { ImageMatcherStage } from './pipeline/stages/image-matcher.stage';
import { StructureValidator } from './pipeline/stages/modular-validators/structure.validator';
import { ContentValidator } from './pipeline/stages/modular-validators/content.validator';
import { NumberValidator } from './pipeline/stages/modular-validators/number.validator';
import { ConfidenceCalculatorStage } from './pipeline/stages/confidence-calculator.stage';
import { OwnPaperPipelineOrchestrator } from './pipeline/own-paper-pipeline.orchestrator';

import { DifficultyEngineService } from './services/difficulty-engine.service';
import { HuggingFaceDatasetService } from './services/huggingface-dataset.service';

@Module({
  imports: [forwardRef(() => RagModule)],
  controllers: [AiController, OwnPaperController, AiHealthController],
  providers: [
    OllamaProvider,
    GeminiProvider,
    AiProviderFactory,
    {
      provide: AI_PROVIDER_TOKEN,
      useFactory: (factory: AiProviderFactory) => factory.create(),
      inject: [AiProviderFactory],
    },
    PdfProcessorService,
    QuestionValidatorService,
    DifficultyEngineService,
    HuggingFaceDatasetService,
    
    // Factory Pipeline Providers
    PaperClassifierStage,
    QualityAnalyzerStage,
    VisionOcrFallbackStage,
    LayoutAnalyzerStage,
    TemplateDetectorStage,
    QuestionSplitterStage,
    QuestionBuilderStage,
    ImageMatcherStage,
    StructureValidator,
    ContentValidator,
    NumberValidator,
    ConfidenceCalculatorStage,
    OwnPaperPipelineOrchestrator,

    OwnPaperService,
    AiService,
    AiCostInterceptor,
  ],
  exports: [
    AiService,
    AI_PROVIDER_TOKEN,
    OwnPaperService,
    PdfProcessorService,
    QuestionValidatorService,
    DifficultyEngineService,
    HuggingFaceDatasetService,
    OwnPaperPipelineOrchestrator,
  ],
})
export class AiModule {}