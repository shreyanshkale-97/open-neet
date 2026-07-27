import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { AiProvider, AiOptions, AiResponse, ValidationResult } from './ai-provider.interface';

@Injectable()
export class GeminiProvider implements AiProvider {
  private readonly logger = new Logger(GeminiProvider.name);
  private genAI: GoogleGenerativeAI | null = null;
  private defaultModel: string;
  private proModel: string;
  private embeddingModel: string;

  constructor(private config: ConfigService) {
    const apiKey = this.config.get<string>('ai.apiKey') ?? '';
    this.defaultModel = this.config.get<string>('ai.model') ?? 'gemini-1.5-flash';
    this.proModel = this.config.get<string>('ai.proModel') ?? 'gemini-1.5-pro';
    this.embeddingModel = this.config.get<string>('ai.embeddingModel') ?? 'text-embedding-004';

    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey);
    } else {
      this.logger.warn('Gemini API key is missing. AI calls will operate in fallback mode.');
    }
  }

  async generateContent(prompt: string, options?: AiOptions): Promise<AiResponse> {
    const start = Date.now();
    const modelName = options?.useAdvancedModel ? this.proModel : this.defaultModel;

    if (!this.genAI) {
      return {
        text: 'Fallback mock AI response: Gemini API key not configured.',
        promptTokens: 10,
        outputTokens: 10,
        totalTokens: 20,
        model: modelName,
        responseTimeMs: Date.now() - start,
      };
    }

    try {
      const model = this.genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      const duration = Date.now() - start;

      // Estimate tokens
      const promptTokens = Math.ceil(prompt.length / 4);
      const outputTokens = Math.ceil(text.length / 4);

      return {
        text,
        promptTokens,
        outputTokens,
        totalTokens: promptTokens + outputTokens,
        model: modelName,
        responseTimeMs: duration,
      };
    } catch (err) {
      this.logger.error(`Gemini generation error: ${err}`);
      throw err;
    }
  }

  async generateEmbedding(text: string): Promise<number[]> {
    if (!this.genAI) {
      // Mock embedding vector of 1536 zeros
      return new Array(1536).fill(0);
    }
    try {
      const model = this.genAI.getGenerativeModel({ model: this.embeddingModel });
      const result = await model.embedContent(text);
      return result.embedding.values;
    } catch (err) {
      this.logger.error(`Gemini embedding error: ${err}`);
      return new Array(1536).fill(0);
    }
  }

  async validateQuestion(
    questionText: string,
    options: string[],
    correctOption: string
  ): Promise<ValidationResult> {
    const prompt = `
Validate the following NEET question:
Question: ${questionText}
Options: ${options.join(', ')}
Correct Answer: ${correctOption}

Check:
1. Is the question scientific and accurate for NEET level?
2. Is there exactly one correct answer?
3. Are options distinct and non-overlapping?

Respond ONLY in JSON format:
{
  "isValid": true/false,
  "issues": ["list of issues if any"],
  "suggestedFix": "suggestion if needed"
}
`;

    try {
      const res = await this.generateContent(prompt, { useAdvancedModel: false });
      const cleanJson = res.text.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      return {
        isValid: Boolean(parsed.isValid),
        issues: Array.isArray(parsed.issues) ? parsed.issues : [],
        suggestedFix: parsed.suggestedFix,
      };
    } catch {
      return { isValid: true, issues: [] };
    }
  }
}