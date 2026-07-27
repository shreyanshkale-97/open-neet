export function buildQuestionGenerationPrompt(params: {
  subjectName: string;
  unitName?: string;
  topicName?: string;
  difficulty: number;
  count: number;
  ragContext?: string;
}): string {
  return `
You are an expert NEET Medical Examination item writer and NTA paper setter.
Generate ${params.count} high-quality, authentic NEET-UG multiple choice questions.

Subject: ${params.subjectName}
${params.unitName ? `Unit: ${params.unitName}` : ''}
${params.topicName ? `Topic: ${params.topicName}` : ''}
Difficulty Level: ${params.difficulty}/10 (NCERT aligned)

${params.ragContext ? `Reference NCERT Context:\n${params.ragContext}\n` : ''}

Strict Formatting Requirements:
1. Each question must strictly follow the standard NEET-UG 4-option format (A, B, C, D).
2. Exactly one option must be 100% correct. The distractors must be plausible but unambiguously incorrect.
3. Include a comprehensive, step-by-step NCERT-based explanation.

Respond ONLY with a valid JSON array of question objects adhering to this JSON schema:
[
  {
    "questionText": "Question text here...",
    "difficulty": ${params.difficulty},
    "questionType": "SINGLE_CORRECT",
    "options": [
      { "optionLabel": "A", "optionText": "Option A text" },
      { "optionLabel": "B", "optionText": "Option B text" },
      { "optionLabel": "C", "optionText": "Option C text" },
      { "optionLabel": "D", "optionText": "Option D text" }
    ],
    "correctOption": "A",
    "explanation": "Detailed step-by-step NCERT explanation..."
  }
]
`;
}