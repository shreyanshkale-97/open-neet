// ─── Versioned Question Generation Prompt — generator-v2 ──────────────────────
// Version: v2 (NMC NEET UG 2026/2027 Official Rationalized Syllabus Edition)
// Used by: AiService → question generation pipeline & AI Test Generator
// Model: Qwen / Gemini AI Engine

export const GENERATOR_PROMPT_VERSION_V2 = 'generator-v2_neet2027';

export function buildGeneratorSystemPromptV2(): string {
  return `You are a senior item writer and subject matter expert for the National Eligibility cum Entrance Test (NEET UG 2026/2027) set by the National Medical Commission (NMC) and NTA.

You MUST follow these strict examination constraints:
1. SYLLABUS ALIGNMENT: Base questions strictly on the latest NCERT Class 11 and Class 12 rationalized syllabus for Physics, Chemistry, Botany, and Zoology.
2. EXCLUDED DELETED TOPICS: NEVER generate questions from deleted chapters (Solid State, Surface Chemistry, Metallurgy, Hydrogen, s-Block, Communication Systems, Reproduction in Organisms, Environmental Issues, Digestion and Absorption).
3. QUESTION VARIETY & SCHEME:
   - SINGLE_CORRECT: Standard 4-option MCQs (A, B, C, D).
   - ASSERTION_REASON: Include "Assertion (A): ..." and "Reason (R): ..." with standard 4-choice response patterns.
   - STATEMENT_BASED: "Statement I: ..." and "Statement II: ..." evaluation.
   - MATCH_FOLLOWING: "Match List I with List II" matching matrices.
4. SYMBOL ACCURACY: Preserve standard scientific notation ($\pi, \alpha, \beta, \gamma, \mu, \Omega, \text{\AA}, \text{°C}, \rightarrow, \rightleftharpoons, \sqrt{}$).
5. QUALITY: Every question must be unambiguous, contain exactly 4 distinct options, have one clear correct answer, and include a concise NCERT-based step-by-step explanation.`;
}

export function buildGeneratorUserPromptV2(params: {
  subjectName: string;
  unitName?: string;
  chapterName?: string;
  difficulty: number;
  count: number;
  ragContext?: string;
  keyConcepts?: string[];
  questionTypesDistribution?: {
    singleCorrectPct?: number;
    assertionReasonPct?: number;
    statementBasedPct?: number;
    matchFollowingPct?: number;
  };
}): string {
  const {
    subjectName,
    unitName,
    chapterName,
    difficulty,
    count,
    ragContext,
    keyConcepts,
  } = params;

  const difficultyLabel =
    difficulty <= 3
      ? 'Easy (Direct NCERT line recall)'
      : difficulty <= 6
      ? 'Medium (Numerical application / Conceptual relationship)'
      : 'Hard (Multi-statement assertion-reason & multi-step calculations)';

  return `Generate exactly ${count} high-quality NEET UG 2027 pattern MCQ questions.

Subject: ${subjectName}
${unitName ? `Unit: ${unitName}` : ''}
${chapterName ? `Chapter: ${chapterName}` : ''}
Target Difficulty: ${difficultyLabel} (${difficulty}/10)
${keyConcepts && keyConcepts.length ? `Key Focus Concepts: ${keyConcepts.join(', ')}` : ''}

${ragContext ? `Primary NCERT Reference Text:\n${ragContext}\n` : ''}

Rules:
- DO NOT generate questions from deleted rationalized chapters.
- Format assertion-reason, statement I/II, and match List I with List II questions cleanly.
- Each question MUST have exactly 4 options (labeled A, B, C, D).
- Specify the single correct option label ("A", "B", "C", or "D").
- Provide an explanation strictly referencing NCERT concepts.

Return ONLY a valid JSON array matching this exact structure:
[
  {
    "questionText": "Question text here (or List I / List II / Assertion & Reason)",
    "difficulty": ${difficulty},
    "questionType": "SINGLE_CORRECT", // Or "ASSERTION_REASON", "STATEMENT_BASED", "MATCH_FOLLOWING"
    "options": [
      { "optionLabel": "A", "optionText": "Option A text" },
      { "optionLabel": "B", "optionText": "Option B text" },
      { "optionLabel": "C", "optionText": "Option C text" },
      { "optionLabel": "D", "optionText": "Option D text" }
    ],
    "correctOption": "A",
    "explanation": "Detailed NCERT step-by-step solution and explanation."
  }
]`;
}
