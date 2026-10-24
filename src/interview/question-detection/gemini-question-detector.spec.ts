import { Logger } from '@nestjs/common';
import { GeminiQuestionDetector } from './gemini-question-detector';
import { QuestionDetectionConfig } from './question-detection.config';
import {
  type DetectionAdapterOutcome,
  type LlmQuestionDetectionInput,
  QuestionDetectionAdapterError,
} from './llm-question-detector.types';

describe('GeminiQuestionDetector', () => {
  const originalEnv = process.env;
  const originalFetch = global.fetch;
  const question = 'Como você valida uma mudança?';
  const privateDetail = 'private-provider-body-secret';
  const input: LlmQuestionDetectionInput = {
    chunks: [{ id: 'opaque-id', sequence: 3, content: question }],
    deterministicCandidate: question,
    deterministicConfidence: 0.76,
    provider: 'gemini',
    model: 'gemini-2.0-flash',
  };
  const detected = {
    status: 'DETECTED',
    question,
    confidence: 0.82,
    evidence: [{ chunkId: 'opaque-id', sequence: 3 }],
  };
  let logger: jest.SpyInstance;

  function response(wire: unknown): Response {
    return envelope(JSON.stringify(wire));
  }

  function envelope(text: string): Response {
    return new Response(
      JSON.stringify({ candidates: [{ content: { parts: [{ text }] } }] }),
    );
  }

  function detector(): GeminiQuestionDetector {
    return new GeminiQuestionDetector(new QuestionDetectionConfig());
  }

  async function expectFailure(
    request: Promise<unknown>,
    outcome: DetectionAdapterOutcome,
    calls = 1,
  ): Promise<void> {
    const error: unknown = await request.catch((caught: unknown) => caught);
    expect(error).toBeInstanceOf(QuestionDetectionAdapterError);
    expect(error).toMatchObject({ outcome });
    expect(JSON.stringify(error)).not.toContain(privateDetail);
    expect(global.fetch).toHaveBeenCalledTimes(calls);
    const logged = JSON.stringify(logger.mock.calls);
    expect(logged).not.toContain(question);
    expect(logged).not.toContain('opaque-id');
    expect(logged).not.toContain(privateDetail);
    const logCalls = logger.mock.calls as unknown[][];
    const logData = logCalls[0][0] as Record<string, unknown>;
    expect(Object.keys(logData).sort()).toEqual([
      'durationMs',
      'model',
      'outcome',
      'provider',
    ]);
    expect(logData.provider).toBe('gemini');
    expect(logData.outcome).toBe(outcome);
    expect(typeof logData.model).toBe('string');
    expect(typeof logData.durationMs).toBe('number');
  }

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      GEMINI_API_KEY: 'synthetic-key',
      QUESTION_DETECTION_MODEL: 'gemini-2.0-flash',
      QUESTION_DETECTION_ALLOWED_MODELS: 'gemini-2.0-flash',
      QUESTION_DETECTION_TIMEOUT_MS: '1500',
    };
    global.fetch = jest.fn().mockResolvedValue(response(detected));
    logger = jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    process.env = originalEnv;
    global.fetch = originalFetch;
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('returns strict normalized output from one minimal Gemini request', async () => {
    await expect(detector().detect(input)).resolves.toEqual({
      ...detected,
      provider: 'gemini',
      model: 'gemini-2.0-flash',
      adapterVersion: 'llm-v1',
    });
    expect(global.fetch).toHaveBeenCalledTimes(1);
    const [url, options] = (global.fetch as jest.Mock).mock.calls[0] as [
      string,
      RequestInit,
    ];
    expect(url).toBe(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
    );
    expect(options.signal).toBeInstanceOf(AbortSignal);
    const body = JSON.parse(options.body as string) as {
      contents: Array<{ parts: Array<{ text: string }> }>;
      systemInstruction: { parts: Array<{ text: string }> };
      generationConfig: { temperature: number; responseMimeType: string };
    };
    expect(JSON.parse(body.contents[0].parts[0].text)).toEqual({
      chunks: input.chunks,
      deterministicCandidate: question,
      deterministicConfidence: 0.76,
    });
    expect(body.generationConfig).toMatchObject({
      temperature: 0,
      responseMimeType: 'application/json',
    });
    expect(body.systemInstruction.parts[0].text).toContain('literal');
    expect(JSON.stringify(options)).not.toContain('resumeText');
    expect(JSON.stringify(logger.mock.calls)).not.toContain(question);
  });

  it('accepts a valid NOT_FOUND with no evidence', async () => {
    const notFound = {
      status: 'NOT_FOUND',
      question: null,
      confidence: 0.69,
      evidence: [],
    };
    global.fetch = jest.fn().mockResolvedValue(response(notFound));
    await expect(detector().detect(input)).resolves.toMatchObject(notFound);
  });

  it.each([
    ['extra field', { ...detected, explanation: privateDetail }],
    ['null', null],
    ['array', [detected]],
    ['missing field', { status: 'DETECTED', question, confidence: 0.82 }],
    ['status', { ...detected, status: 'MAYBE' }],
    ['blank question', { ...detected, question: '  ' }],
    ['null detected', { ...detected, question: null }],
    ['long question', { ...detected, question: 'x'.repeat(241) }],
    ['negative confidence', { ...detected, confidence: -0.1 }],
    ['high confidence', { ...detected, confidence: 1.1 }],
    ['string confidence', { ...detected, confidence: '0.82' }],
    ['null confidence', { ...detected, confidence: null }],
    ['missing evidence', { ...detected, evidence: [] }],
    [
      'multiple evidence',
      { ...detected, evidence: [...detected.evidence, ...detected.evidence] },
    ],
    [
      'extra excerpt',
      {
        ...detected,
        evidence: [{ ...detected.evidence[0], excerpt: question }],
      },
    ],
    [
      'unknown chunk',
      { ...detected, evidence: [{ chunkId: 'missing', sequence: 3 }] },
    ],
    [
      'wrong sequence',
      { ...detected, evidence: [{ chunkId: 'opaque-id', sequence: 4 }] },
    ],
    [
      'fractional sequence',
      { ...detected, evidence: [{ chunkId: 'opaque-id', sequence: 3.1 }] },
    ],
    [
      'string sequence',
      { ...detected, evidence: [{ chunkId: 'opaque-id', sequence: '3' }] },
    ],
    ['null evidence', { ...detected, evidence: [null] }],
    [
      'NOT_FOUND question',
      { status: 'NOT_FOUND', question, confidence: 0.4, evidence: [] },
    ],
    [
      'NOT_FOUND threshold',
      { status: 'NOT_FOUND', question: null, confidence: 0.7, evidence: [] },
    ],
    [
      'NOT_FOUND evidence',
      {
        status: 'NOT_FOUND',
        question: null,
        confidence: 0.4,
        evidence: detected.evidence,
      },
    ],
  ])('rejects %s without retry or sensitive logging', async (_label, wire) => {
    global.fetch = jest.fn().mockResolvedValue(response(wire));
    await expectFailure(detector().detect(input), 'invalid_contract');
  });

  it.each(['not-json', '```json\n{}\n```', '{} trailing'])(
    'rejects wire JSON %s',
    async (text) => {
      global.fetch = jest.fn().mockResolvedValue(envelope(text));
      await expectFailure(detector().detect(input), 'invalid_json');
    },
  );

  it.each([
    {},
    { candidates: [] },
    { candidates: [{ content: { parts: [] } }] },
    { candidates: [{ content: { parts: [{ text: '' }] } }] },
    { candidates: [{ content: { parts: [{ text: '{}' }, { text: '{}' }] } }] },
    { candidates: [{ content: { parts: [{ text: 42 }] } }] },
  ])('rejects an invalid Gemini envelope %j', async (body) => {
    global.fetch = jest
      .fn()
      .mockResolvedValue(new Response(JSON.stringify(body)));
    await expectFailure(detector().detect(input), 'invalid_envelope');
  });

  it('rejects invalid outer JSON', async () => {
    global.fetch = jest.fn().mockResolvedValue(new Response(privateDetail));
    await expectFailure(detector().detect(input), 'invalid_json');
  });

  it.each([429, 500, 503])('sanitizes HTTP %s', async (status) => {
    global.fetch = jest
      .fn()
      .mockResolvedValue(new Response(privateDetail, { status }));
    await expectFailure(detector().detect(input), 'http_error');
  });

  it('sanitizes network errors', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error(privateDetail));
    await expectFailure(detector().detect(input), 'network_error');
  });

  it.each(['TimeoutError', 'AbortError'])(
    'sanitizes %s without retry',
    async (name) => {
      global.fetch = jest
        .fn()
        .mockRejectedValue(Object.assign(new Error(privateDetail), { name }));
      await expectFailure(detector().detect(input), 'timeout');
    },
  );

  it('does not call Gemini when the shared credential is missing', async () => {
    delete process.env.GEMINI_API_KEY;
    await expectFailure(detector().detect(input), 'config_error', 0);
  });

  it('does not call a model outside the detection allowlist', async () => {
    await expectFailure(
      detector().detect({ ...input, model: 'gemini-pro' }),
      'config_error',
      0,
    );
  });

  it.each(['fetch', 'body'])(
    'aborts at the configured deadline during %s',
    async (stage) => {
      jest.useFakeTimers();
      process.env.QUESTION_DETECTION_TIMEOUT_MS = '250';
      global.fetch = jest
        .fn()
        .mockImplementation(() =>
          stage === 'fetch'
            ? new Promise(() => {})
            : Promise.resolve({ ok: true, text: () => new Promise(() => {}) }),
        );
      const request = expectFailure(detector().detect(input), 'timeout');
      await jest.advanceTimersByTimeAsync(249);
      const [, options] = (global.fetch as jest.MockedFunction<typeof fetch>)
        .mock.calls[0];
      expect(options?.signal?.aborted).toBe(false);
      await jest.advanceTimersByTimeAsync(1);
      expect(options?.signal?.aborted).toBe(true);
      await request;
      expect(jest.getTimerCount()).toBe(0);
    },
  );
});
