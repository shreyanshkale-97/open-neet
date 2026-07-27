import { z } from 'zod';

export const createTestSchema = z.object({
  testType: z.enum(['OWN_PAPER', 'FULL_MOCK', 'CUSTOM']),
  subjectId: z.string().uuid().optional(),
  unitIds: z.array(z.string().uuid()).optional(),
  topicIds: z.array(z.string().uuid()).optional(),
  difficulty: z.number().int().min(1).max(10).optional(),
  questionCount: z.number().int().min(1).max(180).optional(),
  durationMinutes: z.number().int().min(1).max(360).optional(),
  documentIds: z.array(z.string().uuid()).optional(),
});

export const submitAnswerSchema = z.object({
  questionId: z.string().uuid(),
  selectedOption: z.enum(['A', 'B', 'C', 'D']).nullable(),
  markedForReview: z.boolean().optional(),
});

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
  fullName: z.string().min(2).max(100),
  targetNeetYear: z.number().int().min(2025).max(2040).optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type CreateTestInput = z.infer<typeof createTestSchema>;
export type SubmitAnswerInput = z.infer<typeof submitAnswerSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;