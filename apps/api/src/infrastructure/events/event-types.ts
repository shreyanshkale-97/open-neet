export class TestSubmittedEvent {
  constructor(
    public readonly testId: string,
    public readonly userId: string,
  ) {}
}

export class TestEvaluatedEvent {
  constructor(
    public readonly testId: string,
    public readonly userId: string,
    public readonly score: number,
    public readonly maxScore: number,
    public readonly accuracy: number,
  ) {}
}

export class ReportReadyEvent {
  constructor(
    public readonly testId: string,
    public readonly userId: string,
    public readonly reportId: string,
  ) {}
}

export class DocumentUploadedEvent {
  constructor(
    public readonly documentId: string,
    public readonly userId: string,
    public readonly storagePath: string,
  ) {}
}

export class QuestionGeneratedEvent {
  constructor(
    public readonly questionIds: string[],
    public readonly jobId: string,
    public readonly userId: string,
  ) {}
}

export class AiJobFailedEvent {
  constructor(
    public readonly jobId: string,
    public readonly userId: string,
    public readonly error: string,
    public readonly adminNotify: boolean = true,
  ) {}
}