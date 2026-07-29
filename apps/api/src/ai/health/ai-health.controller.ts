import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { AiProvider, AI_PROVIDER_TOKEN, AiHealthStatus } from '../providers/ai-provider.interface';

@Controller('health/ai')
export class AiHealthController {
  constructor(
    @Inject(AI_PROVIDER_TOKEN) private readonly aiProvider: AiProvider,
  ) {}

  /**
   * GET /api/health/ai
   *
   * Checks:
   *  1. Can connect to AI provider?
   *  2. Are required models installed?
   *
   * Returns 200 if healthy, 503 if Ollama is offline or models are missing.
   *
   * Example healthy response:
   * {
   *   "status": "healthy",
   *   "provider": "ollama",
   *   "textModel": "qwen2.5:7b",
   *   "visionModel": "qwen2.5vl:7b",
   *   "embedModel": "nomic-embed-text",
   *   "latencyMs": 42
   * }
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  async checkHealth(): Promise<object> {
    const health: AiHealthStatus = await this.aiProvider.healthCheck();

    return {
      status: health.ok ? 'healthy' : 'unhealthy',
      provider: health.provider,
      textModel: health.textModel,
      visionModel: health.visionModel,
      embedModel: health.embedModel,
      latencyMs: health.latencyMs,
      ...(health.error ? { error: health.error } : {}),
    };
  }
}
