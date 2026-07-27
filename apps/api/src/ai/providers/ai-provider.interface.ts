export interface AiOptions {
  useAdvancedModel?: boolean;
  temperature?: number;
  maxOutputTokens?: number;
}

export interface AiResponse {
  text: string;
  promptTokens: number;
  outputTokens: number;
  totalTokens: number;
  model: string;
  responseTimeMs: number;
}

export interface ValidationResult {
  isValid: boolean;
  issues: string[];
  suggestedFix?: string;
}

export interface AiProvider {
  generateContent(prompt: string, options?: AiOptions): Promise<AiResponse>;
  generateEmbedding(text: string): Promise<number[]>;
  validateQuestion(questionText: string, options: string[], correctOption: string): Promise<ValidationResult>;
}

export const AI_PROVIDER_TOKEN = 'AI_PROVIDER';