import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { GeminiProvider } from './providers/gemini.provider';
import { RagModule } from './rag/rag.module';
import { AiCostInterceptor } from './interceptors/ai-cost.interceptor';

@Module({
  imports: [RagModule],
  controllers: [AiController],
  providers: [AiService, GeminiProvider, AiCostInterceptor],
  exports: [AiService, GeminiProvider],
})
export class AiModule {}