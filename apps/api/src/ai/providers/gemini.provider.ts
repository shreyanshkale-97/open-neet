import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  AiProvider,
  AiOptions,
  AiResponse,
  AiHealthStatus,
  ValidationResult,
} from './ai-provider.interface';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class GeminiProvider implements AiProvider {
  private readonly logger = new Logger(GeminiProvider.name);
  private readonly client: GoogleGenerativeAI;
  private readonly textModel: string;
  private readonly proModel: string;
  private readonly visionModel: string;
  private readonly embeddingModel: string;

  constructor(private readonly config: ConfigService) {
    const apiKey = config.get<string>('ai.apiKey', '');
    this.client = new GoogleGenerativeAI(apiKey);
    this.textModel = config.get<string>('ai.model', 'gemini-2.0-flash');
    this.proModel = config.get<string>('ai.proModel', 'gemini-2.5-flash');
    this.visionModel = config.get<string>('ai.visionModel', 'gemini-2.0-flash');
    this.embeddingModel = config.get<string>('ai.embeddingModel', 'text-embedding-004');
  }

  // ── Text generation ──────────────────────────────────────────────────────────

  async generateContent(prompt: string, options?: AiOptions): Promise<AiResponse> {
    const start = Date.now();
    const modelName = options?.useAdvancedModel ? this.proModel : this.textModel;
    const model = this.client.getGenerativeModel({ model: modelName });

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const responseTimeMs = Date.now() - start;

    const usage = result.response.usageMetadata;
    return {
      text: responseText,
      promptTokens: usage?.promptTokenCount ?? 0,
      outputTokens: usage?.candidatesTokenCount ?? 0,
      totalTokens: usage?.totalTokenCount ?? 0,
      model: modelName,
      responseTimeMs,
    };
  }

  // ── Vision — send page images as inline data ─────────────────────────────────

  async generateWithImages(
    images: Buffer[],
    mimeType: string,
    prompt: string,
  ): Promise<string> {
    const start = Date.now();
    const model = this.client.getGenerativeModel({ model: this.visionModel });

    const parts: any[] = [
      { text: prompt },
      ...images.map(img => ({
        inlineData: {
          data: img.toString('base64'),
          mimeType: mimeType || 'image/png',
        },
      })),
    ];

    const result = await model.generateContent(parts);
    this.logger.debug(`Vision: ${images.length} images, time=${Date.now() - start}ms`);
    return result.response.text();
  }

  // ── PDF direct (Gemini-native, no image conversion needed) ───────────────────

  async generateWithPdf(pdfBuffer: Buffer, prompt: string): Promise<string> {
    const model = this.client.getGenerativeModel({ model: this.visionModel });

    const parts: any[] = [
      { text: prompt },
      {
        inlineData: {
          data: pdfBuffer.toString('base64'),
          mimeType: 'application/pdf',
        },
      },
    ];

    const result = await model.generateContent(parts);
    return result.response.text();
  }

  // ── Embeddings ────────────────────────────────────────────────────────────────

  async generateEmbedding(text: string): Promise<number[]> {
    const model = this.client.getGenerativeModel({ model: this.embeddingModel });
    const result = await model.embedContent(text);
    return result.embedding.values;
  }

  // ── Validation ────────────────────────────────────────────────────────────────

  async validateQuestion(
    questionText: string,
    options: string[],
    correctOption: string,
  ): Promise<ValidationResult> {
    const prompt = `Validate this NEET exam question:
Question: ${questionText}
Options: ${options.map((o, i) => `${String.fromCharCode(65 + i)}) ${o}`).join('\n')}
Correct: ${correctOption}

Is this valid? Reply JSON: {"isValid": true/false, "issues": [], "suggestedFix": ""}`;

    const res = await this.generateContent(prompt, { temperature: 0.1 });
    try {
      const cleaned = res.text.replace(/```json|```/g, '').trim();
      return JSON.parse(cleaned) as ValidationResult;
    } catch {
      return { isValid: true, issues: [] };
    }
  }

  // ── Health check ──────────────────────────────────────────────────────────────

  async healthCheck(): Promise<AiHealthStatus> {
    const apiKey = this.config.get<string>('ai.apiKey', '');
    if (!apiKey) {
      return {
        ok: false,
        provider: 'gemini',
        textModel: this.textModel,
        visionModel: this.visionModel,
        embedModel: this.embeddingModel,
        error: 'GEMINI_API_KEY is not configured',
      };
    }

    try {
      const start = Date.now();
      const model = this.client.getGenerativeModel({ model: this.textModel });
      await model.generateContent('ping');
      return {
        ok: true,
        provider: 'gemini',
        textModel: this.textModel,
        visionModel: this.visionModel,
        embedModel: this.embeddingModel,
        latencyMs: Date.now() - start,
      };
    } catch (err: any) {
      return {
        ok: false,
        provider: 'gemini',
        textModel: this.textModel,
        visionModel: this.visionModel,
        embedModel: this.embeddingModel,
        error: err.message,
      };
    }
  }
}