import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { MetricsService } from '../../infrastructure/observability/metrics.service';
import { AiResponse } from '../providers/ai-provider.interface';

@Injectable()
export class AiCostInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AiCostInterceptor.name);

  constructor(
    private prisma: PrismaService,
    private metrics: MetricsService
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      tap(async (result) => {
        if (result && typeof result === 'object' && 'promptTokens' in result && 'model' in result) {
          const res = result as AiResponse;
          const req = context.switchToHttp().getRequest();
          const userId = req?.user?.id || req?.user?.authUserId;

          // Gemini Flash: ~$0.075 / 1M tokens; Gemini Pro: ~$1.25 / 1M tokens
          const ratePerMillion = res.model.includes('pro') ? 1.25 : 0.075;
          const estimatedCost = (res.totalTokens / 1_000_000) * ratePerMillion;

          this.metrics.recordAiUsage(res.totalTokens, estimatedCost);

          try {
            await this.prisma.aiCostLog.create({
              data: {
                userId: userId || null,
                model: res.model,
                promptTokens: res.promptTokens,
                outputTokens: res.outputTokens,
                totalTokens: res.totalTokens,
                estimatedCostUsd: estimatedCost,
                responseTimeMs: res.responseTimeMs,
                operation: context.getHandler().name || 'ai_operation',
              },
            });
          } catch (err) {
            this.logger.error(`Failed to record AI cost log: ${err}`);
          }
        }
      })
    );
  }
}