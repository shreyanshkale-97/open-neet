import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  AiProvider,
  AiOptions,
  AiResponse,
  AiHealthStatus,
  ValidationResult,
} from './ai-provider.interface';

// ─── Ollama API response types ────────────────────────────────────────────────

interface OllamaChatResponse {
  model: string;
  message: {
    role: string;
    content: string;
  };
  done: boolean;
  prompt_eval_count?: number;
  eval_count?: number;
}

interface OllamaEmbedResponse {
  embeddings: number[][];
}

interface OllamaTagsResponse {
  models: Array<{ name: string; size: number }>;
}

// ─── OllamaProvider ──────────────────────────────────────────────────────────

@Injectable()
export class OllamaProvider implements AiProvider {
  private readonly logger = new Logger(OllamaProvider.name);

  private readonly baseUrl: string;
  private readonly textModel: string;
  private readonly visionModel: string;
  private readonly embedModel: string;

  constructor(private readonly config: ConfigService) {
    this.baseUrl = config.get<string>('ollama.url', 'http://localhost:11434');
    this.textModel = config.get<string>('ollama.model', 'qwen2.5:7b');
    this.visionModel = config.get<string>('ollama.visionModel', 'qwen2.5vl:7b');
    this.embedModel = config.get<string>('ollama.embedModel', 'nomic-embed-text');

    this.logger.log(
      `OllamaProvider initialized — url=${this.baseUrl} ` +
      `text=${this.textModel} vision=${this.visionModel} embed=${this.embedModel}`,
    );
  }

  // ── Text generation ──────────────────────────────────────────────────────────
  // Uses /api/chat for better model compatibility and future conversation support.

  async generateContent(prompt: string, options?: AiOptions): Promise<AiResponse> {
    const start = Date.now();
    const model = options?.useAdvancedModel ? this.visionModel : this.textModel;

    const body = {
      model,
      messages: [
        {
          role: 'system',
          content:
            'You are an expert NEET exam assistant. Respond with valid JSON only when asked for structured data.',
        },
        { role: 'user', content: prompt },
      ],
      stream: false,
      options: {
        temperature: options?.temperature ?? 0.3,
        num_predict: options?.maxOutputTokens ?? 4096,
      },
    };

    const data = await this.post<OllamaChatResponse>('/api/chat', body);
    const responseTimeMs = Date.now() - start;

    return {
      text: data.message?.content ?? '',
      promptTokens: data.prompt_eval_count ?? 0,
      outputTokens: data.eval_count ?? 0,
      totalTokens: (data.prompt_eval_count ?? 0) + (data.eval_count ?? 0),
      model: data.model,
      responseTimeMs,
    };
  }

  // ── Vision (multimodal) ──────────────────────────────────────────────────────
  // Sends a batch of page PNG images with the extraction prompt.
  // Ollama vision models accept base64-encoded images in the `images` array.

  async generateWithImages(
    images: Buffer[],
    _mimeType: string,
    prompt: string,
  ): Promise<string> {
    const start = Date.now();

    // Encode all page images as base64
    const base64Images = images.map(img => img.toString('base64'));

    const body = {
      model: this.visionModel,
      messages: [
        {
          role: 'user',
          content: prompt,
          images: base64Images, // Ollama /api/chat vision format
        },
      ],
      stream: false,
      options: {
        temperature: 0.1,   // Low temperature for extraction — we want deterministic output
        num_predict: 8192,  // Large context for multi-page batches
      },
    };

    const data = await this.post<OllamaChatResponse>('/api/chat', body);
    const elapsed = Date.now() - start;

    this.logger.debug(
      `Vision extraction: ${images.length} images, model=${this.visionModel}, ` +
      `time=${elapsed}ms, output=${data.message?.content?.length ?? 0} chars`,
    );

    return data.message?.content ?? '';
  }

  // ── Embeddings ────────────────────────────────────────────────────────────────
  // Uses /api/embed (Ollama v0.1.26+ supports batch embedding)

  async generateEmbedding(text: string): Promise<number[]> {
    const body = {
      model: this.embedModel,
      input: text,
    };

    const data = await this.post<OllamaEmbedResponse>('/api/embed', body);

    // /api/embed returns embeddings as a 2D array; take the first vector
    const embedding = data.embeddings?.[0];
    if (!embedding || embedding.length === 0) {
      throw new Error(`OllamaProvider: empty embedding returned for model ${this.embedModel}`);
    }

    return embedding;
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

Is this a valid, well-formed NEET question? Reply with JSON:
{"isValid": true/false, "issues": ["issue1", "issue2"], "suggestedFix": "optional fix"}`;

    const res = await this.generateContent(prompt, { temperature: 0.1 });
    try {
      const cleaned = res.text.replace(/```json|```/g, '').trim();
      return JSON.parse(cleaned) as ValidationResult;
    } catch {
      return { isValid: true, issues: [] }; // Fail open for validation
    }
  }

  // ── Health check ──────────────────────────────────────────────────────────────
  // Calls GET /api/tags — returns installed models list.
  // Used by GET /api/health/ai endpoint.

  async healthCheck(): Promise<AiHealthStatus> {
    const start = Date.now();

    try {
      const response = await fetch(`${this.baseUrl}/api/tags`, {
        signal: AbortSignal.timeout(5000), // 5s timeout
      });

      if (!response.ok) {
        return {
          ok: false,
          provider: 'ollama',
          textModel: this.textModel,
          visionModel: this.visionModel,
          embedModel: this.embedModel,
          error: `Ollama returned HTTP ${response.status}`,
        };
      }

      const data = (await response.json()) as OllamaTagsResponse;
      const installedModels = (data.models ?? []).map(m => m.name);

      const textInstalled = installedModels.some(m => m.startsWith(this.textModel.split(':')[0]));
      const visionInstalled = installedModels.some(m =>
        m.startsWith(this.visionModel.split(':')[0]),
      );
      const embedInstalled = installedModels.some(m =>
        m.startsWith(this.embedModel.split(':')[0]),
      );

      const missingModels: string[] = [];
      if (!textInstalled) missingModels.push(`${this.textModel} (text)`);
      if (!visionInstalled) missingModels.push(`${this.visionModel} (vision)`);
      if (!embedInstalled) missingModels.push(`${this.embedModel} (embed)`);

      return {
        ok: missingModels.length === 0,
        provider: 'ollama',
        textModel: this.textModel,
        visionModel: this.visionModel,
        embedModel: this.embedModel,
        latencyMs: Date.now() - start,
        error:
          missingModels.length > 0
            ? `Models not installed: ${missingModels.join(', ')}. Run: ollama pull <model>`
            : undefined,
      };
    } catch (err: any) {
      return {
        ok: false,
        provider: 'ollama',
        textModel: this.textModel,
        visionModel: this.visionModel,
        embedModel: this.embedModel,
        error: 'Ollama server is not running. Start it with: ollama serve',
      };
    }
  }

  // ── Private: HTTP helper ──────────────────────────────────────────────────────

  private async post<T>(path: string, body: object): Promise<T> {
    const url = `${this.baseUrl}${path}`;

    let response: Response;
    try {
      response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        // No timeout for inference — models can take 30-60s for large inputs
      });
    } catch (err: any) {
      // Network error = Ollama is not running
      throw new ServiceUnavailableException(
        'Ollama server is not running. Start it with: ollama serve',
      );
    }

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'unknown error');
      throw new ServiceUnavailableException(
        `Ollama returned HTTP ${response.status}: ${errorText}`,
      );
    }

    return response.json() as Promise<T>;
  }
}
