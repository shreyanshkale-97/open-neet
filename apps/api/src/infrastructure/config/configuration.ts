import { registerAs } from '@nestjs/config';

export const appConfig = registerAs('app', () => ({
  port: parseInt(process.env['API_PORT'] ?? '3001', 10),
  nodeEnv: process.env['NODE_ENV'] ?? 'development',
  apiVersion: process.env['API_VERSION'] ?? 'v1',
  frontendUrl: process.env['FRONTEND_URL'] ?? 'http://localhost:5173',
}));

export const supabaseConfig = registerAs('supabase', () => ({
  url: process.env['SUPABASE_URL'] ?? '',
  anonKey: process.env['SUPABASE_ANON_KEY'] ?? '',
  serviceRoleKey: process.env['SUPABASE_SERVICE_ROLE_KEY'] ?? '',
  databaseUrl: process.env['DATABASE_URL'] ?? '',
  directUrl: process.env['DIRECT_URL'] ?? '',
}));

export const redisConfig = registerAs('redis', () => ({
  url: process.env['REDIS_URL'] ?? 'redis://localhost:6379',
  ttlSeconds: parseInt(process.env['REDIS_CACHE_TTL_SECONDS'] ?? '300', 10),
}));

export const aiConfig = registerAs('ai', () => ({
  // Which provider to use: 'ollama' (default, local) | 'gemini' (cloud)
  provider: process.env['AI_PROVIDER'] ?? 'ollama',
  // Gemini credentials (used when AI_PROVIDER=gemini)
  apiKey: process.env['GEMINI_API_KEY'] ?? '',
  model: process.env['GEMINI_MODEL'] ?? 'gemini-2.0-flash',
  proModel: process.env['GEMINI_PRO_MODEL'] ?? 'gemini-2.5-flash',
  embeddingModel: process.env['GEMINI_EMBEDDING_MODEL'] ?? 'text-embedding-004',
  visionModel: process.env['GEMINI_VISION_MODEL'] ?? 'gemini-2.0-flash',
}));

export const ollamaConfig = registerAs('ollama', () => ({
  url: process.env['OLLAMA_URL'] ?? 'http://localhost:11434',
  model: process.env['OLLAMA_MODEL'] ?? 'qwen2.5:7b',
  visionModel: process.env['OLLAMA_VISION_MODEL'] ?? 'llava:7b',
  embedModel: process.env['OLLAMA_EMBED_MODEL'] ?? 'nomic-embed-text',
}));

export const jwtConfig = registerAs('jwt', () => ({
  secret: process.env['JWT_SECRET'] ?? 'default-jwt-secret-change-in-production-min-32-chars',
  expiry: process.env['JWT_EXPIRY'] ?? '7d',
}));

export const storageConfig = registerAs('storage', () => ({
  bucket: process.env['STORAGE_BUCKET'] ?? 'neet-ai-platform',
  maxUploadSizeMb: parseInt(process.env['MAX_UPLOAD_SIZE_MB'] ?? '20', 10),
}));

export const throttleConfig = registerAs('throttle', () => ({
  ttl: parseInt(process.env['THROTTLE_TTL_SECONDS'] ?? '60', 10),
  limit: parseInt(process.env['THROTTLE_LIMIT'] ?? '100', 10),
  aiLimit: parseInt(process.env['AI_THROTTLE_LIMIT'] ?? '10', 10),
}));

export const featureFlagsConfig = registerAs('features', () => ({
  aiTutor: process.env['FEATURE_AI_TUTOR'] === 'true',
  adaptiveTest: process.env['FEATURE_ADAPTIVE_TEST'] === 'true',
  leaderboard: process.env['FEATURE_LEADERBOARD'] === 'true',
  voiceMode: process.env['FEATURE_VOICE_MODE'] === 'true',
  ownPaperMode: process.env['FEATURE_OWN_PAPER_MODE'] === 'true',
  youtubeRag: process.env['FEATURE_YOUTUBE_RAG'] === 'true',
}));