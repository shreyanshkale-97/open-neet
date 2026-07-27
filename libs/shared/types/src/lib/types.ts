// ─────────────────────────────────────────────────────────────────────────
// Shared TypeScript Types — used by frontend, api, and worker
// ─────────────────────────────────────────────────────────────────────────

// ─── Enums ───────────────────────────────────────────────────────────────

export enum Role {
  STUDENT = 'STUDENT',
  ADMIN = 'ADMIN',
  CONTENT_MANAGER = 'CONTENT_MANAGER',
  AI_REVIEWER = 'AI_REVIEWER',
  SUPPORT = 'SUPPORT',
  ANALYST = 'ANALYST',
}

export enum QuestionType {
  SINGLE_CORRECT = 'SINGLE_CORRECT',
  MULTIPLE_CORRECT = 'MULTIPLE_CORRECT',
  ASSERTION_REASON = 'ASSERTION_REASON',
  INTEGER = 'INTEGER',
  MATCH_FOLLOWING = 'MATCH_FOLLOWING',
  DIAGRAM = 'DIAGRAM',
}

export enum QuestionSource {
  NCERT = 'NCERT',
  AI_GENERATED = 'AI_GENERATED',
  PREVIOUS_YEAR = 'PREVIOUS_YEAR',
  TEACHER = 'TEACHER',
  STUDENT_NOTES = 'STUDENT_NOTES',
  BOOK = 'BOOK',
  YOUTUBE = 'YOUTUBE',
}

export enum QuestionStatus {
  PENDING_REVIEW = 'PENDING_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  ARCHIVED = 'ARCHIVED',
}

export enum TestType {
  OWN_PAPER = 'OWN_PAPER',
  FULL_MOCK = 'FULL_MOCK',
  CUSTOM = 'CUSTOM',
}

export enum TestStatus {
  CREATED = 'CREATED',
  IN_PROGRESS = 'IN_PROGRESS',
  SUBMITTED = 'SUBMITTED',
  EVALUATED = 'EVALUATED',
  ABANDONED = 'ABANDONED',
}

export enum DocumentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  OCR = 'OCR',
  CHUNKING = 'CHUNKING',
  EMBEDDING = 'EMBEDDING',
  READY = 'READY',
  FAILED = 'FAILED',
}

export enum AiJobStatus {
  QUEUED = 'QUEUED',
  VALIDATING = 'VALIDATING',
  OCR = 'OCR',
  CHUNKING = 'CHUNKING',
  EMBEDDING = 'EMBEDDING',
  RETRIEVING = 'RETRIEVING',
  GENERATING = 'GENERATING',
  AI_VALIDATING = 'AI_VALIDATING',
  STORING = 'STORING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  DEAD_LETTER = 'DEAD_LETTER',
}

export enum JobType {
  DOCUMENT_PROCESSING = 'DOCUMENT_PROCESSING',
  QUESTION_GENERATION = 'QUESTION_GENERATION',
  OCR = 'OCR',
  EMBEDDING = 'EMBEDDING',
  REPORT_GENERATION = 'REPORT_GENERATION',
}

export enum FeatureFlag {
  AI_TUTOR = 'AI_TUTOR',
  ADAPTIVE_TEST = 'ADAPTIVE_TEST',
  LEADERBOARD = 'LEADERBOARD',
  VOICE_MODE = 'VOICE_MODE',
  OWN_PAPER_MODE = 'OWN_PAPER_MODE',
  YOUTUBE_RAG = 'YOUTUBE_RAG',
}

// ─── Question Palette State ───────────────────────────────────────────────

export enum PaletteState {
  NOT_VISITED = 'NOT_VISITED',       // ⬜ white
  NOT_ANSWERED = 'NOT_ANSWERED',     // 🟥 red
  ANSWERED = 'ANSWERED',             // 🟩 green
  MARKED_REVIEW = 'MARKED_REVIEW',   // 🟨 yellow
}

// ─── NEET Scoring Constants ───────────────────────────────────────────────

export const NEET_SCORING = {
  CORRECT: 4,
  WRONG: -1,
  SKIPPED: 0,
  TOTAL_QUESTIONS: 180,
  TOTAL_MARKS: 720,
  DURATION_MINUTES: 180,
  SUBJECTS: {
    PHYSICS: { count: 45 },
    CHEMISTRY: { count: 45 },
    BOTANY: { count: 45 },
    ZOOLOGY: { count: 45 },
  },
} as const;

// ─── API Response Wrappers ────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: true;
  data: T;
  timestamp: string;
}

export interface ApiError {
  success: false;
  error: string;
  message: string;
  statusCode: number;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  success: true;
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  timestamp: string;
}

// ─── Core Domain Types ────────────────────────────────────────────────────

export interface Profile {
  id: string;
  authUserId: string;
  fullName: string;
  email: string;
  role: Role;
  targetNeetYear?: number;
  avatarUrl?: string;
  isSuspended: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Subject {
  id: string;
  name: string;
  displayOrder: number;
  units?: Unit[];
}

export interface Unit {
  id: string;
  subjectId: string;
  name: string;
  displayOrder: number;
  topics?: Topic[];
}

export interface Topic {
  id: string;
  unitId: string;
  name: string;
  displayOrder: number;
}

export interface QuestionOption {
  id: string;
  questionId: string;
  optionLabel: 'A' | 'B' | 'C' | 'D';
  optionText: string;
}

export interface Question {
  id: string;
  subjectId: string;
  unitId: string;
  topicId: string;
  questionText: string;
  difficulty: number;        // 1–10
  questionType: QuestionType;
  correctOption: 'A' | 'B' | 'C' | 'D';
  explanation: string;
  source: QuestionSource;
  imageUrl?: string;
  status: QuestionStatus;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
  options?: QuestionOption[];
}

// ─── Test Engine Types ────────────────────────────────────────────────────

export interface Test {
  id: string;
  userId: string;
  testType: TestType;
  difficulty?: number;
  totalQuestions: number;
  durationMinutes: number;
  status: TestStatus;
  startedAt?: string;
  submittedAt?: string;
  endTime?: string;          // computed: startedAt + durationMinutes
  createdAt: string;
}

export interface TestQuestion {
  id: string;
  testId: string;
  questionId: string;
  questionOrder: number;
  question?: Question;
}

export interface StudentAnswer {
  id: string;
  testId: string;
  userId: string;
  questionId: string;
  selectedOption?: 'A' | 'B' | 'C' | 'D';
  isCorrect?: boolean;
  markedForReview: boolean;
  visited: boolean;
  answeredAt?: string;
}

export interface Result {
  id: string;
  testId: string;
  score: number;
  maxScore: number;
  correct: number;
  wrong: number;
  skipped: number;
  accuracy: number;          // 0–100
  negativeMarks: number;
  timeTakenSeconds: number;
}

export interface SubjectBreakdown {
  subjectId: string;
  subjectName: string;
  score: number;
  correct: number;
  wrong: number;
  skipped: number;
  accuracy: number;
}

export interface TopicBreakdown {
  topicId: string;
  topicName: string;
  correct: number;
  wrong: number;
  accuracy: number;
}

export interface Report {
  id: string;
  testId: string;
  subjectBreakdown: SubjectBreakdown[];
  topicBreakdown: TopicBreakdown[];
  weakTopics: string[];      // topicIds
  strongTopics: string[];    // topicIds
  createdAt: string;
}

// ─── AI / RAG Types ──────────────────────────────────────────────────────

export interface AiJob {
  id: string;
  userId: string;
  jobType: JobType;
  status: AiJobStatus;
  progress: number;          // 0–100
  currentStep?: string;
  result?: unknown;
  error?: string;
  retryCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface GenerateQuestionsRequest {
  subjectId: string;
  unitId?: string;
  topicIds?: string[];
  difficulty: number;        // 1–10
  count: number;
  useAdvancedModel?: boolean;
  documentIds?: string[];    // optional RAG sources
}

// ─── Dashboard Types ──────────────────────────────────────────────────────

export interface DashboardStats {
  highestScore: number;
  averageScore: number;
  studyStreakDays: number;
  totalStudyHours: number;
  totalTestsTaken: number;
  weakTopics: Topic[];
  strongTopics: Topic[];
  activeTest?: Test;
  recentTests: Array<Test & { result?: Result }>;
}
