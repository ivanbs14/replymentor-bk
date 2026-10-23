export type QuestionDetectionEvidence = {
  chunkId: string;
  sequence: number;
  excerpt: string;
};

export type QuestionDetectionContract = {
  id: string;
  status: 'DETECTED' | 'NOT_FOUND';
  question: string | null;
  confidence: number | null;
  source: 'LEGACY' | 'DETERMINISTIC' | 'LLM' | 'MANUAL';
  evidence: QuestionDetectionEvidence[];
  detectorVersion: string;
  provider: string | null;
  model: string | null;
  createdAt: Date;
};

export type SuggestedAnswerContract = {
  id: string;
  detectedQuestion: string;
  suggestedAnswer: string;
  shortVersion: string;
  keyPoints: string[];
  strategicNote: string;
  createdAt: Date;
};

export type AnswerReadyResult = SuggestedAnswerContract & {
  status: 'ANSWER_READY';
  detection: QuestionDetectionContract;
  answer: SuggestedAnswerContract;
};

export type NeedsConfirmationResult = {
  status: 'NEEDS_CONFIRMATION';
  detection: QuestionDetectionContract;
  answer: null;
};

export type GenerateResponseResult =
  | AnswerReadyResult
  | NeedsConfirmationResult;
