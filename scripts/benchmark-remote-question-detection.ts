import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { performance } from 'node:perf_hooks';
import { detectLatestQuestion } from '../src/interview/question-detection/deterministic-question-detector';
import { GeminiQuestionDetector } from '../src/interview/question-detection/gemini-question-detector';
import {
  type DetectionAdapterOutcome,
  type LlmQuestionDetector,
  QuestionDetectionAdapterError,
} from '../src/interview/question-detection/llm-question-detector.types';
import { QuestionDetectionConfig } from '../src/interview/question-detection/question-detection.config';

type Environment = Record<string, string | undefined>;

type CorpusCase = {
  id: string;
  chunks: string[];
};

type RemoteSampleInput = {
  durationMs: number;
  outcome: string;
  [privateField: string]: unknown;
};

export type SanitizedRemoteSample = {
  durationMs: number;
  outcome: string;
};

type RemoteBenchmarkReport = {
  generatedAt: string;
  provider: 'gemini';
  model: string;
  sampleSize: number;
  loadProfile: 'serial, concurrency=1, no retry';
  successes: number;
  failures: number;
  outcomes: Record<string, number>;
  latency: { p50Ms: number; p95Ms: number; maxMs: number };
  targetP95Ms: 1500;
  targetMet: boolean;
  blocking: false;
};

type BenchmarkConfig = Pick<
  QuestionDetectionConfig,
  'provider' | 'model' | 'timeoutMs' | 'assertAllowedModel'
>;

export type RemoteBenchmarkDependencies = {
  env: Environment;
  config: BenchmarkConfig;
  detector: LlmQuestionDetector;
  corpus: CorpusCase[];
  now: () => number;
  generatedAt: () => string;
};

// Reviewed cases from the corpus's ambiguous band. Keeping the selection fixed
// makes benchmark runs comparable while avoiding any identifiers in the report.
export const REMOTE_CASE_IDS = [
  'without_punctuation-002',
  'without_punctuation-010',
  'implicit_question-002',
  'implicit_question-010',
  'candidate_after_question-012',
  'candidate_after_question-020',
  'noise-006',
  'noise-014',
] as const;

export function assertRemoteBenchmarkEnabled(env: Environment): void {
  if (env.RUN_REMOTE_QUESTION_BENCHMARK !== 'true') {
    throw new Error('Set RUN_REMOTE_QUESTION_BENCHMARK=true to opt in.');
  }
}

export function sanitizeRemoteSample(
  sample: RemoteSampleInput,
): SanitizedRemoteSample {
  return { durationMs: sample.durationMs, outcome: sample.outcome };
}

function createDefaultDependencies(): RemoteBenchmarkDependencies {
  const config = new QuestionDetectionConfig();
  return {
    env: process.env,
    config,
    detector: new GeminiQuestionDetector(config),
    corpus: JSON.parse(
      readFileSync(
        resolve('test/fixtures/question-detection-corpus.json'),
        'utf8',
      ),
    ) as CorpusCase[],
    now: () => performance.now(),
    generatedAt: () => new Date().toISOString(),
  };
}

function percentile(values: number[], fraction: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((left, right) => left - right);
  return sorted[Math.ceil(sorted.length * fraction) - 1];
}

function chunksFor(item: CorpusCase) {
  return item.chunks.map((content, index) => ({
    id: `${item.id}-chunk-${index + 1}`,
    sequence: index + 1,
    content,
  }));
}

function errorOutcome(
  error: unknown,
): DetectionAdapterOutcome | 'unexpected_error' {
  return error instanceof QuestionDetectionAdapterError
    ? error.outcome
    : 'unexpected_error';
}

export async function runRemoteBenchmark(
  dependencies: RemoteBenchmarkDependencies = createDefaultDependencies(),
): Promise<RemoteBenchmarkReport> {
  const { env, config, detector, corpus, now, generatedAt } = dependencies;
  assertRemoteBenchmarkEnabled(env);
  if (!env.GEMINI_API_KEY?.trim()) {
    throw new Error('Set GEMINI_API_KEY before running the remote benchmark.');
  }

  config.assertAllowedModel(config.model);
  const byId = new Map(corpus.map((item) => [item.id, item]));
  const cases = REMOTE_CASE_IDS.map((id) => {
    const item = byId.get(id);
    if (!item) throw new Error('Remote benchmark corpus selection is invalid.');
    const confidence = detectLatestQuestion(chunksFor(item)).confidence;
    if (confidence < 0.5 || confidence >= 0.85) {
      throw new Error('Remote benchmark selection must remain ambiguous.');
    }
    return item;
  });

  const samples: SanitizedRemoteSample[] = [];
  for (const item of cases) {
    const chunks = chunksFor(item);
    const deterministic = detectLatestQuestion(chunks);
    const started = now();
    let outcome: string;
    try {
      const result = await detector.detect({
        chunks,
        deterministicCandidate: deterministic.question ?? '',
        deterministicConfidence: deterministic.confidence,
        provider: config.provider,
        model: config.model,
      });
      outcome = result.status === 'DETECTED' ? 'detected' : 'not_found';
    } catch (error: unknown) {
      outcome = errorOutcome(error);
    }
    samples.push(
      sanitizeRemoteSample({
        durationMs: now() - started,
        outcome,
      }),
    );
  }

  const outcomes = samples.reduce<Record<string, number>>((counts, sample) => {
    counts[sample.outcome] = (counts[sample.outcome] ?? 0) + 1;
    return counts;
  }, {});
  const successes = (outcomes.detected ?? 0) + (outcomes.not_found ?? 0);
  const successfulDurations = samples
    .filter(
      (sample) =>
        sample.outcome === 'detected' || sample.outcome === 'not_found',
    )
    .map((sample) => sample.durationMs);
  const p95Ms = percentile(successfulDurations, 0.95);
  return {
    generatedAt: generatedAt(),
    provider: 'gemini',
    model: config.model,
    sampleSize: samples.length,
    loadProfile: 'serial, concurrency=1, no retry',
    successes,
    failures: samples.length - successes,
    outcomes,
    latency: {
      p50Ms: percentile(successfulDurations, 0.5),
      p95Ms,
      maxMs: Math.max(...successfulDurations, 0),
    },
    targetP95Ms: 1500,
    targetMet: successes > 0 && p95Ms <= 1500,
    blocking: false,
  };
}

async function main(): Promise<void> {
  const report = await runRemoteBenchmark();
  const generatedDirectory = resolve('generated');
  mkdirSync(generatedDirectory, { recursive: true });
  writeFileSync(
    resolve(generatedDirectory, 'feat-020-remote-benchmark.json'),
    `${JSON.stringify(report, null, 2)}\n`,
    { mode: 0o600 },
  );
  console.log(JSON.stringify(report, null, 2));
}

if (require.main === module) {
  void main().catch((error: unknown) => {
    console.error(
      error instanceof Error ? error.message : 'Remote benchmark failed.',
    );
    process.exitCode = 1;
  });
}
