import { Module } from '@nestjs/common';
import { AppConfigModule } from '../../../api/src/infrastructure/config/config.module';
import { PrismaModule } from '../../../api/src/infrastructure/database/prisma.module';
import { CacheModule } from '../../../api/src/infrastructure/cache/cache.module';
import { AppEventsModule } from '../../../api/src/infrastructure/events/events.module';
import { AppQueueModule } from '../../../api/src/infrastructure/queue/queue.module';
import { ObservabilityModule } from '../../../api/src/infrastructure/observability/observability.module';
import { AiModule } from '../../../api/src/ai/ai.module';
import { AiGenerationProcessor } from '../jobs/ai-generation.processor';
import { DocumentProcessingProcessor } from '../jobs/document-processing.processor';
import { OcrProcessor } from '../jobs/ocr.processor';
import { EmbeddingProcessor } from '../jobs/embedding.processor';
import { ReportProcessor } from '../jobs/report.processor';
import { NotificationProcessor } from '../jobs/notification.processor';
import { CleanupProcessor } from '../jobs/cleanup.processor';
import { AnalyticsProcessor } from '../jobs/analytics.processor';
import { AppService } from './app.service';

@Module({
  imports: [
    AppConfigModule,
    PrismaModule,
    CacheModule,
    AppEventsModule,
    AppQueueModule,
    ObservabilityModule,
    AiModule,
  ],
  providers: [
    AppService,
    AiGenerationProcessor,
    DocumentProcessingProcessor,
    OcrProcessor,
    EmbeddingProcessor,
    ReportProcessor,
    NotificationProcessor,
    CleanupProcessor,
    AnalyticsProcessor,
  ],
})
export class AppModule {}