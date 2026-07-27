export const QUEUES = {
  AI_GENERATION: 'ai-generation',
  DOCUMENT_PROCESSING: 'document-processing',
  OCR: 'ocr',
  EMBEDDINGS: 'embeddings',
  NOTIFICATIONS: 'notifications',
  REPORTS: 'reports',
  CLEANUP: 'cleanup',
  ANALYTICS: 'analytics',
} as const;

export type QueueName = typeof QUEUES[keyof typeof QUEUES];