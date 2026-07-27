import { Module } from '@nestjs/common';
import { AppConfigModule } from '../infrastructure/config/config.module';
import { PrismaModule } from '../infrastructure/database/prisma.module';
import { CacheModule } from '../infrastructure/cache/cache.module';
import { AppEventsModule } from '../infrastructure/events/events.module';
import { AppQueueModule } from '../infrastructure/queue/queue.module';
import { FeatureFlagsModule } from '../infrastructure/feature-flags/feature-flags.module';
import { ObservabilityModule } from '../infrastructure/observability/observability.module';
import { AuditModule } from '../infrastructure/audit/audit.module';
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
  ],
  controllers: [HealthController],
  providers: [AppService],
})
export class AppModule {}