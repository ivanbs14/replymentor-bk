import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { performance } from 'node:perf_hooks';
import {
  DETERMINISTIC_QUESTION_DETECTOR_VERSION,
  detectLatestQuestion,
} from '../src/interview/question-detection/deterministic-question-detector';

type CorpusCase = {
  id: string;
  category: string;
  description: string;
  chunks: string[];
  expectedQuestion: string | null;
};

type Evaluation = CorpusCase & {
  predictedQuestion: string | null;
  status: 'DETECTED' | 'NOT_FOUND';
  confidence: number;
  correct: boolean;
};

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

const corpus = JSON.parse(
  readFileSync(
    resolve(process.cwd(), 'test/fixtures/question-detection-corpus.json'),
    'utf8',
  ),
) as CorpusCase[];
const durations: number[] = [];
const evaluations: Evaluation[] = corpus.map((item) => {
  const input = item.chunks.map((content, index) => ({
    id: `${item.id}-chunk-${index + 1}`,
    sequence: index + 1,
    content,
  }));
  let result = detectLatestQuestion(input);
  for (let iteration = 0; iteration < 1_000; iteration += 1) {
    const startedAt = performance.now();
    result = detectLatestQuestion(input);
    durations.push(performance.now() - startedAt);
  }
  return {
    ...item,
    predictedQuestion: result.question,
    status: result.status,
    confidence: result.confidence,
    correct:
      normalizeQuestion(result.question) ===
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
    const categoryCorrect = items.filter((item) => item.correct).length;
    return [
      category,
      {
        total: items.length,
        correct: categoryCorrect,
        accuracy: categoryCorrect / items.length,
      },
    ];
  }),
);
const confidenceBands = {
  direct: evaluations.filter((item) => item.confidence >= 0.85).length,
  ambiguous: evaluations.filter(
    (item) => item.confidence >= 0.5 && item.confidence < 0.85,
  ).length,
  notFound: evaluations.filter((item) => item.confidence < 0.5).length,
  ambiguousByCategory: Object.fromEntries(
    [...new Set(evaluations.map((item) => item.category))].map((category) => [
      category,
      evaluations.filter(
        (item) =>
          item.category === category &&
          item.confidence >= 0.5 &&
          item.confidence < 0.85,
      ).length,
    ]),
  ),
};

const report = {
  detectorVersion: DETERMINISTIC_QUESTION_DETECTOR_VERSION,
  corpusSize: evaluations.length,
  metrics: {
    normalizedAccuracy: correct / evaluations.length,
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
  confusionMatrix: {
    truePositive,
    falsePositive,
    falseNegative,
    trueNegative,
  },
  confidenceBands,
  categories,
  failures: evaluations
    .filter((item) => !item.correct)
    .map(
      ({
        id,
        category,
        expectedQuestion,
        predictedQuestion,
        status,
        confidence,
      }) => ({
        id,
        category,
        expectedQuestion,
        predictedQuestion,
        status,
        confidence,
      }),
    ),
};

const outputPath = resolve(
  process.cwd(),
  'generated/feat-017-deterministic-v1.json',
);
mkdirSync(resolve(process.cwd(), 'generated'), { recursive: true });
writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
console.log(JSON.stringify(report, null, 2));
