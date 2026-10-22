import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { performance } from 'node:perf_hooks';

type CorpusCase = {
  id: string;
  category: string;
  description: string;
  chunks: string[];
  expectedQuestion: string | null;
};

type Evaluation = CorpusCase & {
  predictedQuestion: string | null;
  correct: boolean;
};

export function detectLatestQuestionCurrent(
  transcriptWindow: string,
): string | null {
  const lines = transcriptWindow
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  for (let index = lines.length - 1; index >= 0; index -= 1) {
    if (lines[index].endsWith('?')) return lines[index];
  }

  return lines.length > 0 ? lines[lines.length - 1] : null;
}

function normalizeQuestion(value: string | null): string | null {
  if (value === null) return null;
  return value
    .replace(/^(entrevistador|recrutador|candidato)\s*:\s*/i, '')
    .replace(/[?.!]+$/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLocaleLowerCase('pt-BR');
}

function percentile(values: number[], percentileValue: number): number {
  const sorted = [...values].sort((left, right) => left - right);
  const index = Math.ceil((percentileValue / 100) * sorted.length) - 1;
  return sorted[Math.max(0, index)] ?? 0;
}

const corpusPath = resolve(
  process.cwd(),
  'test/fixtures/question-detection-corpus.json',
);
const corpus = JSON.parse(readFileSync(corpusPath, 'utf8')) as CorpusCase[];
const durations: number[] = [];
const evaluations: Evaluation[] = corpus.map((item) => {
  const transcriptWindow = item.chunks.join('\n');
  let predictedQuestion: string | null = null;
  for (let iteration = 0; iteration < 1_000; iteration += 1) {
    const startedAt = performance.now();
    predictedQuestion = detectLatestQuestionCurrent(transcriptWindow);
    durations.push(performance.now() - startedAt);
  }
  return {
    ...item,
    predictedQuestion,
    correct:
      normalizeQuestion(predictedQuestion) ===
      normalizeQuestion(item.expectedQuestion),
  };
});

const expectedDetected = evaluations.filter(
  (item) => item.expectedQuestion !== null,
);
const truePositive = expectedDetected.filter(
  (item) => item.predictedQuestion !== null,
).length;
const falseNegative = expectedDetected.length - truePositive;
const falsePositive = evaluations.filter(
  (item) => item.expectedQuestion === null && item.predictedQuestion !== null,
).length;
const trueNegative = evaluations.filter(
  (item) => item.expectedQuestion === null && item.predictedQuestion === null,
).length;
const precision = truePositive / Math.max(1, truePositive + falsePositive);
const recall = truePositive / Math.max(1, truePositive + falseNegative);
const f1 =
  (2 * precision * recall) / Math.max(Number.EPSILON, precision + recall);
const correct = evaluations.filter((item) => item.correct).length;
const categories = Object.fromEntries(
  [...new Set(evaluations.map((item) => item.category))].map((category) => {
    const items = evaluations.filter((item) => item.category === category);
    return [
      category,
      {
        total: items.length,
        correct: items.filter((item) => item.correct).length,
        accuracy: items.filter((item) => item.correct).length / items.length,
      },
    ];
  }),
);

const report = {
  detectorVersion: 'current-v1',
  corpusSize: evaluations.length,
  metrics: {
    exactAccuracy: correct / evaluations.length,
    correct,
    precision,
    recall,
    f1,
    truePositive,
    falsePositive,
    falseNegative,
    trueNegative,
    latencyP95Ms: percentile(durations, 95),
  },
  categories,
  failures: evaluations
    .filter((item) => !item.correct)
    .map(({ id, category, expectedQuestion, predictedQuestion }) => ({
      id,
      category,
      expectedQuestion,
      predictedQuestion,
    })),
};

const outputPath = resolve(
  process.cwd(),
  'generated/feat-012-current-baseline.json',
);
mkdirSync(resolve(process.cwd(), 'generated'), { recursive: true });
writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
console.log(JSON.stringify(report, null, 2));
