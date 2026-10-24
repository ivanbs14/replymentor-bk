import { Injectable } from '@nestjs/common';

@Injectable()
export class QuestionDetectionConfig {
  readonly provider = 'gemini' as const;
  readonly model = process.env.QUESTION_DETECTION_MODEL ?? 'gemini-2.0-flash';
  readonly timeoutMs: number;
  private readonly allowedModels: ReadonlySet<string>;

  constructor() {
    const timeout = process.env.QUESTION_DETECTION_TIMEOUT_MS ?? '1500';
    if (
      !/^\d+$/.test(timeout) ||
      !Number.isSafeInteger(Number(timeout)) ||
      Number(timeout) < 250 ||
      Number(timeout) > 1500
    ) {
      throw new Error(
        'QUESTION_DETECTION_TIMEOUT_MS deve ser inteiro entre 250 e 1500.',
      );
    }
    this.timeoutMs = Number(timeout);
    this.allowedModels = new Set(
      (process.env.QUESTION_DETECTION_ALLOWED_MODELS ?? 'gemini-2.0-flash')
        .split(',')
        .map((model) => model.trim())
        .filter(Boolean),
    );
  }

  assertAllowedModel(model: string): void {
    if (!this.allowedModels.has(model)) {
      throw new Error('QUESTION_DETECTION_MODEL não permitido.');
    }
  }
}
