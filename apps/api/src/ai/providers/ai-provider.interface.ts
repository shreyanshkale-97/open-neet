// ─── AI Provider Interface ────────────────────────────────────────────────────
// All AI providers (Ollama, Gemini, future) must implement this interface.
// Business logic only depends on this contract — never on concrete providers.

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

export interface AiHealthStatus {
  ok: boolean;
  provider: string;
  textModel: string;
  visionModel: string;
  embedModel: string;
  latencyMs?: number;
  error?: string;
}

export interface AiProvider {
  // ── Text generation ──────────────────────────────────────────────────────
  /** Generate text from a prompt. Used for question generation, explanations, RAG. */
  generateContent(prompt: string, options?: AiOptions): Promise<AiResponse>;

  // ── Vision (multimodal) ──────────────────────────────────────────────────
  /** Send one or more page images (PNG/JPEG buffers) to the vision model.
   *  Used for Own Paper PDF extraction. Never used for question generation. */
  generateWithImages(images: Buffer[], mimeType: string, prompt: string): Promise<string>;

  // ── Embeddings ────────────────────────────────────────────────────────────
  /** Generate a vector embedding for RAG similarity search. */
  generateEmbedding(text: string): Promise<number[]>;

  // ── Validation ────────────────────────────────────────────────────────────
  /** Validate a question + options using the AI model. */
  validateQuestion(
    questionText: string,
    options: string[],
    correctOption: string,
  ): Promise<ValidationResult>;

  // ── Health ────────────────────────────────────────────────────────────────
  /** Check if the provider is reachable and models are available. */
  healthCheck(): Promise<AiHealthStatus>;
}

export const AI_PROVIDER_TOKEN = 'AI_PROVIDER';