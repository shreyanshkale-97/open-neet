import { Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { AppConfigModule } from '../infrastructure/config/config.module';
import { PrismaModule } from '../infrastructure/database/prisma.module';
import { CacheModule } from '../infrastructure/cache/cache.module';
import { AppEventsModule } from '../infrastructure/events/events.module';
import { AppQueueModule } from '../infrastructure/queue/queue.module';
import { FeatureFlagsModule } from '../infrastructure/feature-flags/feature-flags.module';
import { ObservabilityModule } from '../infrastructure/observability/observability.module';
import { AuditModule } from '../infrastructure/audit/audit.module';
import { AuthModule } from '../core/auth/auth.module';
import { UsersModule } from '../core/users/users.module';
import { QuestionsModule } from '../learning/questions/questions.module';
import { StorageModule } from '../core/storage/storage.module';
import { AiModule } from '../ai/ai.module';
import { AssessmentModule } from '../assessment/tests/tests.module';
import { AdminModule } from '../admin/admin.module';
import { GlobalExceptionFilter } from '../infrastructure/common/filters/global-exception.filter';
import { ResponseInterceptor } from '../infrastructure/common/interceptors/response.interceptor';
import { HealthController } from '../health/health.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    AppConfigModule,
    PrismaModule,
    CacheModule,
    AppEventsModule,
    AppQueueModule,
    FeatureFlagsModule,
    ObservabilityModule,
    AuditModule,
    AuthModule,
    UsersModule,
    QuestionsModule,
    StorageModule,
    AiModule,
    AssessmentModule,
    AdminModule,
  ],
  controllers: [HealthController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
  ],
})
export class AppModule {}