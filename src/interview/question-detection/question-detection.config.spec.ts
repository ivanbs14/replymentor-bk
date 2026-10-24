import { QuestionDetectionConfig } from './question-detection.config';

describe('QuestionDetectionConfig', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.QUESTION_DETECTION_MODEL;
    delete process.env.QUESTION_DETECTION_TIMEOUT_MS;
    delete process.env.QUESTION_DETECTION_ALLOWED_MODELS;
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('uses isolated Gemini defaults', () => {
    process.env.LLM_PROVIDER = 'openai';
    process.env.GEMINI_MODEL = 'generation-only';
    process.env.GEMINI_ALLOWED_MODELS = 'generation-only';
    process.env.LLM_TIMEOUT_MS = '90000';
    const config = new QuestionDetectionConfig();
    expect(config.provider).toBe('gemini');
    expect(config.model).toBe('gemini-2.0-flash');
    expect(config.timeoutMs).toBe(1500);
    expect(config.assertAllowedModel('gemini-2.0-flash')).toBeUndefined();
    expect(() => config.assertAllowedModel('generation-only')).toThrow();
  });

  it.each(['249', '1501', '1.5', 'NaN', '', ' ', '1000ms', 'Infinity'])(
    'rejects invalid timeout %j at startup',
    (timeout) => {
      process.env.QUESTION_DETECTION_TIMEOUT_MS = timeout;
      expect(() => new QuestionDetectionConfig()).toThrow(
        'QUESTION_DETECTION_TIMEOUT_MS deve ser inteiro entre 250 e 1500.',
      );
    },
  );

  it.each(['250', '1500'])('accepts timeout boundary %s', (timeout) => {
    process.env.QUESTION_DETECTION_TIMEOUT_MS = timeout;
    expect(new QuestionDetectionConfig().timeoutMs).toBe(Number(timeout));
  });

  it('enforces the independent model allowlist without blocking startup', () => {
    process.env.QUESTION_DETECTION_MODEL = 'outside-allowlist';
    const config = new QuestionDetectionConfig();
    expect(() => config.assertAllowedModel(config.model)).toThrow();
  });

  it('parses only exact nonempty allowlist entries', () => {
    process.env.QUESTION_DETECTION_ALLOWED_MODELS =
      ' gemini-2.0-flash, ,custom ';
    const config = new QuestionDetectionConfig();
    expect(config.assertAllowedModel('custom')).toBeUndefined();
    expect(() => config.assertAllowedModel('gemini')).toThrow();
    expect(() => config.assertAllowedModel('')).toThrow();
  });
});
