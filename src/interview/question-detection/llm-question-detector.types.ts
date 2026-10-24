export type LlmQuestionDetectionInput = {
  chunks: Array<{ id: string; sequence: number; content: string }>;
  deterministicCandidate: string;
  deterministicConfidence: number;
  provider: 'gemini';
  model: string;
};

export type LlmQuestionDetectionOutput = {
  status: 'DETECTED' | 'NOT_FOUND';
  question: string | null;
  confidence: number;
  // Provider references only; excerpts are reconstructed by the hybrid detector.
  evidence: Array<{ chunkId: string; sequence: number }>;
  provider: 'gemini';
  model: string;
  adapterVersion: 'llm-v1';
};

export interface LlmQuestionDetector {
  detect(input: LlmQuestionDetectionInput): Promise<LlmQuestionDetectionOutput>;
}

export type DetectionAdapterOutcome =
  | 'detected'
  | 'not_found'
  | 'config_error'
  | 'timeout'
  | 'network_error'
  | 'http_error'
  | 'invalid_json'
  | 'invalid_envelope'
  | 'invalid_contract';

export class QuestionDetectionAdapterError extends Error {
  constructor(readonly outcome: DetectionAdapterOutcome) {
    super('Question detection adapter failed');
    this.name = 'QuestionDetectionAdapterError';
  }
}
