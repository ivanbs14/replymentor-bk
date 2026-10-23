import { readFileSync } from 'node:fs';
import { performance } from 'node:perf_hooks';
import { resolve } from 'node:path';
import { detectLatestQuestion } from './deterministic-question-detector';

type CorpusCase = {
  id: string;
  category: string;
  chunks: string[];
  expectedQuestion: string | null;
};

type BaselineReport = {
  failures: Array<{ id: string }>;
};

const corpus = JSON.parse(
  readFileSync(
    resolve(process.cwd(), 'test/fixtures/question-detection-corpus.json'),
    'utf8',
  ),
) as CorpusCase[];
const baseline = JSON.parse(
  readFileSync(
    resolve(process.cwd(), 'generated/feat-012-current-baseline.json'),
    'utf8',
  ),
) as BaselineReport;

function normalize(value: string | null): string | null {
  if (value === null) return null;
  return value
    .replace(/^(entrevistador|recrutador|candidato)\s*:\s*/i, '')
    .replace(/[?.!]+$/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLocaleLowerCase('pt-BR');
}

describe('deterministic detector corpus', () => {
  const evaluations = corpus.map((item) => {
    const startedAt = performance.now();
    const result = detectLatestQuestion(
      item.chunks.map((content, index) => ({
        id: `${item.id}-chunk-${index + 1}`,
        sequence: index + 1,
        content,
      })),
    );
    return {
      ...item,
      result,
      duration: performance.now() - startedAt,
      correct: normalize(result.question) === normalize(item.expectedQuestion),
    };
  });

  it('evaluates all 120 versioned cases below the latency budget', () => {
    expect(evaluations).toHaveLength(120);
    const sorted = evaluations
      .map((item) => item.duration)
      .sort((left, right) => left - right);
    const p95 = sorted[Math.ceil(sorted.length * 0.95) - 1] ?? Infinity;
    expect(p95).toBeLessThan(1_500);
  });

  it('does not regress any case previously correct in current-v1', () => {
    const baselineFailures = new Set(baseline.failures.map((item) => item.id));
    const regressions = evaluations
      .filter((item) => !baselineFailures.has(item.id) && !item.correct)
      .map((item) => item.id);
    expect(regressions).toEqual([]);
  });

  it('matches the complete expected corpus', () => {
    const failures = evaluations
      .filter((item) => !item.correct)
      .map((item) => ({
        id: item.id,
        expected: item.expectedQuestion,
        received: item.result.question,
      }));
    expect(failures).toEqual([]);
  });
});
