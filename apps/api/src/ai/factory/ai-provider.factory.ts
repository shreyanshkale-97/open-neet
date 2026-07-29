import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AiProvider } from '../providers/ai-provider.interface';
import { OllamaProvider } from '../providers/ollama.provider';
import { GeminiProvider } from '../providers/gemini.provider';

/**
 * AIProviderFactory
 *
 * Reads AI_PROVIDER from environment and returns the correct provider.
 * Business logic never depends on concrete providers — only on AiProvider interface.
 *
 * Switching providers:
 *   AI_PROVIDER=ollama  → OllamaProvider (default, local, no API cost)
 *   AI_PROVIDER=gemini  → GeminiProvider (cloud, requires GEMINI_API_KEY)
 *
 * No code changes needed to switch — only .env changes.
 */
@Injectable()
export class AiProviderFactory {
  private readonly logger = new Logger(AiProviderFactory.name);

  constructor(
    private readonly config: ConfigService,
    private readonly ollamaProvider: OllamaProvider,
    private readonly geminiProvider: GeminiProvider,
  ) {}

  create(): AiProvider {
    const providerName = this.config
      .get<string>('ai.provider', 'ollama')
      .toLowerCase()
      .trim();

    switch (providerName) {
      case 'ollama':
        this.logger.log('AI Provider: Ollama (local)');
        return this.ollamaProvider;

      case 'gemini':
        this.logger.log('AI Provider: Gemini (cloud)');
        return this.geminiProvider;

      default:
        this.logger.warn(
          `Unknown AI_PROVIDER="${providerName}". Falling back to Ollama.`,
        );
        return this.ollamaProvider;
    }
  }
}
