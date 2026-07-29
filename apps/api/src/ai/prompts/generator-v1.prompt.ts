// ─── Versioned Question Generation Prompt — generator-v1 ──────────────────────
// Version: v1
// Used by: AiService → question generation pipeline
// Model: Qwen Text (qwen2.5:7b via Ollama)
//
// NEVER modify this file after deployment — create generator-v2.prompt.ts

export const GENERATOR_PROMPT_VERSION = 'generator-v1';

export function buildGeneratorSystemPrompt(): string {
  return `You are an expert NEET (National Eligibility cum Entrance Test) question creator.
You ONLY generate questions based on NCERT Biology, Physics, and Chemistry textbooks.
You follow the exact NEET exam pattern: MCQ format with 4 options (A, B, C, D), single correct answer.
You NEVER generate incomplete questions. Every question must have exactly 4 clear options and one correct answer.`;
}

export function buildGeneratorUserPrompt(params: {
  subjectName: string;
  topicName?: string;
  difficulty: number;
  count: number;
  ragContext: string;
}): string {
  const { subjectName, topicName, difficulty, count, ragContext } = params;

  const difficultyLabel =
    difficulty <= 3 ? 'Easy (direct recall)' :
    difficulty <= 6 ? 'Medium (application based)' :
    'Hard (analysis and assertion-reason)';

  return `Generate exactly ${count} NEET-style MCQ questions.

Subject: ${subjectName}
${topicName ? `Topic: ${topicName}` : ''}
Difficulty: ${difficultyLabel} (${difficulty}/10)

${ragContext ? `Use ONLY this NCERT reference material to base your questions:\n\n${ragContext}\n` : ''}

Rules:
- Base questions ONLY on the reference material provided (or standard NCERT if none provided)
- Each question must have exactly 4 options labeled A, B, C, D
- Only one option is correct
- Include a brief explanation for the correct answer
- Do NOT repeat questions or paraphrase the same concept

Return ONLY a valid JSON array (no markdown fences, no explanation):
[
  {
    "questionText": "Complete question text here",
    "difficulty": ${difficulty},
    "questionType": "SINGLE_CORRECT",
    "options": [
      { "optionLabel": "A", "optionText": "option A text" },
      { "optionLabel": "B", "optionText": "option B text" },
      { "optionLabel": "C", "optionText": "option C text" },
      { "optionLabel": "D", "optionText": "option D text" }
    ],
    "correctOption": "A",
    "explanation": "Brief explanation of why A is correct"
  }
]`;
}
