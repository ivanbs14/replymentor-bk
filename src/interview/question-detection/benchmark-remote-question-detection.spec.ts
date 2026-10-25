import {
  assertRemoteBenchmarkEnabled,
  REMOTE_CASE_IDS,
  type RemoteBenchmarkDependencies,
  runRemoteBenchmark,
  sanitizeRemoteSample,
} from '../../../scripts/benchmark-remote-question-detection';
import { detectLatestQuestion } from './deterministic-question-detector';
import { QuestionDetectionAdapterError } from './llm-question-detector.types';

type TestCorpusCase = RemoteBenchmarkDependencies['corpus'][number];

function corpusForRemoteIds(): TestCorpusCase[] {
  return REMOTE_CASE_IDS.map((id, index) => ({
    id,
    chunks: [`Explique como lidou com a situação ${index}`],
  }));
}

function dependencies(
  overrides: Partial<RemoteBenchmarkDependencies> = {},
): RemoteBenchmarkDependencies {
  let instant = 0;
  return {
    env: {
      RUN_REMOTE_QUESTION_BENCHMARK: 'true',
      GEMINI_API_KEY: 'test-only-key',
    },
    config: {
      provider: 'gemini',
      model: 'gemini-2.0-flash',
      timeoutMs: 1500,
      assertAllowedModel: jest.fn(),
    },
    detector: {
      detect: jest.fn().mockResolvedValue({
        status: 'NOT_FOUND',
        question: null,
        confidence: 0.5,
        evidence: [],
        provider: 'gemini',
        model: 'gemini-2.0-flash',
        adapterVersion: 'llm-v1',
      }),
    },
    corpus: corpusForRemoteIds(),
    now: () => (instant += 100),
    generatedAt: () => '2026-10-25T12:00:00.000Z',
    ...overrides,
  };
}

describe('FEAT-020 remote question detection benchmark', () => {
  it('requires an explicit opt-in', () => {
    expect(() => assertRemoteBenchmarkEnabled({})).toThrow(
      'Set RUN_REMOTE_QUESTION_BENCHMARK=true',
    );
    expect(() =>
      assertRemoteBenchmarkEnabled({ RUN_REMOTE_QUESTION_BENCHMARK: 'true' }),
    ).not.toThrow();
  });

  it('removes all private input and provider response data from samples', () => {
    expect(
      sanitizeRemoteSample({
        durationMs: 432,
        outcome: 'success',
        question: 'segredo',
        chunks: ['conteúdo privado'],
        responseBody: 'privado',
      }),
    ).toEqual({ durationMs: 432, outcome: 'success' });
  });

  it('runs the fixed ambiguous subset serially once per case and emits only aggregate fields', async () => {
    let active = 0;
    let maximumConcurrency = 0;
    const seenCandidates: number[] = [];
    const detector: RemoteBenchmarkDependencies['detector'] = {
      detect: jest.fn().mockImplementation(async (input) => {
        active += 1;
        maximumConcurrency = Math.max(maximumConcurrency, active);
        seenCandidates.push(input.deterministicConfidence);
        await Promise.resolve();
        active -= 1;
        return {
          status: 'NOT_FOUND',
          question: null,
          confidence: 0.5,
          evidence: [],
          provider: 'gemini',
          model: 'gemini-2.0-flash',
          adapterVersion: 'llm-v1',
        };
      }),
    };

    const report = await runRemoteBenchmark(dependencies({ detector }));

    expect(detector.detect).toHaveBeenCalledTimes(REMOTE_CASE_IDS.length);
    expect(maximumConcurrency).toBe(1);
    expect(
      (detector.detect as jest.Mock).mock.calls.map(
        ([input]) => input.chunks[0].id.split('-chunk-')[0],
      ),
    ).toEqual(REMOTE_CASE_IDS);
    expect(seenCandidates).toHaveLength(REMOTE_CASE_IDS.length);
    expect(seenCandidates.every((value) => value >= 0.5 && value < 0.85)).toBe(
      true,
    );
    expect(report).toEqual({
      generatedAt: '2026-10-25T12:00:00.000Z',
      provider: 'gemini',
      model: 'gemini-2.0-flash',
      sampleSize: REMOTE_CASE_IDS.length,
      loadProfile: 'serial, concurrency=1, no retry',
      successes: REMOTE_CASE_IDS.length,
      failures: 0,
      outcomes: { not_found: REMOTE_CASE_IDS.length },
      latency: { p50Ms: 100, p95Ms: 100, maxMs: 100 },
      targetP95Ms: 1500,
      targetMet: true,
      blocking: false,
    });
    expect(JSON.stringify(report)).not.toMatch(
      /chunks|question|responseBody|prompt|evidence|apiKey|x-goog-api-key/i,
    );
  });

  it('excludes failures from latency and never meets the target with zero successes', async () => {
    const detector: RemoteBenchmarkDependencies['detector'] = {
      detect: jest
        .fn()
        .mockRejectedValue(new QuestionDetectionAdapterError('timeout')),
    };

    const report = await runRemoteBenchmark(dependencies({ detector }));

    expect(detector.detect).toHaveBeenCalledTimes(REMOTE_CASE_IDS.length);
    expect(report.successes).toBe(0);
    expect(report.failures).toBe(REMOTE_CASE_IDS.length);
    expect(report.outcomes).toEqual({ timeout: REMOTE_CASE_IDS.length });
    expect(report.latency).toEqual({ p50Ms: 0, p95Ms: 0, maxMs: 0 });
    expect(report.targetMet).toBe(false);
  });

  it('does not include a slow failed call in successful latency percentiles', async () => {
    const detector: RemoteBenchmarkDependencies['detector'] = {
      detect: jest
        .fn()
        .mockRejectedValueOnce(new QuestionDetectionAdapterError('timeout'))
        .mockResolvedValue({
          status: 'NOT_FOUND',
          question: null,
          confidence: 0.5,
          evidence: [],
          provider: 'gemini',
          model: 'gemini-2.0-flash',
          adapterVersion: 'llm-v1',
        }),
    };
    const instants = [
      0,
      5_000,
      ...Array.from({ length: REMOTE_CASE_IDS.length - 1 }, (_, index) => [
        5_000 + index * 100,
        5_100 + index * 100,
      ]).flat(),
    ];

    const report = await runRemoteBenchmark(
      dependencies({ detector, now: () => instants.shift()! }),
    );

    expect(report.failures).toBe(1);
    expect(report.successes).toBe(REMOTE_CASE_IDS.length - 1);
    expect(report.latency).toEqual({ p50Ms: 100, p95Ms: 100, maxMs: 100 });
    expect(report.targetMet).toBe(true);
  });

  it('keeps the selected synthetic corpus cases in the ambiguous band', () => {
    for (const item of corpusForRemoteIds()) {
      const result = detectLatestQuestion(
        item.chunks.map((content, index) => ({
          id: `${item.id}-chunk-${index + 1}`,
          sequence: index + 1,
          content,
        })),
      );
      expect(result.confidence).toBeGreaterThanOrEqual(0.5);
      expect(result.confidence).toBeLessThan(0.85);
    }
  });
});
