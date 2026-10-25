import {
  buildQualitySummary,
  resolveQualityReportPath,
  sanitizeEvaluation,
} from '../../../scripts/evaluate-hybrid-question-detection';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const latency = {
  localOverheadMs: { samples: 2, p50Ms: 4, p95Ms: 8, maxMs: 8 },
  simulatedCycleMs: { samples: 2, p50Ms: 20, p95Ms: 30, maxMs: 30 },
};

const passingEvaluations = [
  {
    expectedQuestion: 'Como posso ajudar?',
    predictedQuestion: 'Como posso ajudar?',
    calls: 1,
    correct: true,
    regression: false,
    chunks: [{ id: 'detected-1', sequence: 1, content: 'Como posso ajudar?' }],
    evidence: [{ chunkId: 'detected-1', sequence: 1 }],
  },
  {
    expectedQuestion: null,
    predictedQuestion: null,
    calls: 0,
    correct: true,
    regression: false,
    chunks: [{ id: 'not-found-1', sequence: 1, content: 'Obrigado.' }],
    evidence: [],
  },
];

describe('buildQualitySummary', () => {
  it('publishes the complete FEAT-020 metric and gate contract', () => {
    const summary = buildQualitySummary(
      passingEvaluations,
      latency,
      [{ passed: true, calls: 1 }],
      [{ passed: true, calls: 1 }],
    );

    expect(summary).toMatchObject({
      metrics: {
        normalizedAccuracy: 1,
        f1: 1,
        falsePositive: 0,
        falseNegative: 0,
        trueNegative: 1,
        llmCallRate: 0.5,
      },
      latency: {
        additionalDetectionP95Ms: 8,
        simulatedTotalCycleP95Ms: 30,
      },
      gates: {
        accuracy: true,
        f1: true,
        trueNegatives: true,
        noInventedQuestion: true,
        additionalDetectionP95: true,
      },
      passed: true,
    });
  });

  it('fails when a prediction is not traceable to its referenced chunk', () => {
    const evaluations = [
      {
        ...passingEvaluations[0],
        predictedQuestion: 'Pergunta inventada?',
      },
      passingEvaluations[1],
    ];

    const summary = buildQualitySummary(evaluations, latency, [], []);

    expect(summary.gates.noInventedQuestion).toBe(false);
    expect(summary.passed).toBe(false);
  });
});

describe('FEAT-020 generated quality report', () => {
  it('accepts output overrides only for absolute JSON paths in tests', () => {
    const cwd = resolve(__dirname, '../../..');
    const productionPath = resolve(cwd, 'generated/feat-020-quality-gate.json');
    const testPath = join(tmpdir(), 'feat-020-isolated.json');

    expect(
      resolveQualityReportPath(
        { NODE_ENV: 'production', FEAT020_REPORT_PATH: testPath },
        cwd,
      ),
    ).toBe(productionPath);
    expect(
      resolveQualityReportPath(
        { NODE_ENV: 'test', FEAT020_REPORT_PATH: testPath },
        cwd,
      ),
    ).toBe(testPath);
    expect(() =>
      resolveQualityReportPath(
        { NODE_ENV: 'test', FEAT020_REPORT_PATH: 'relative.json' },
        cwd,
      ),
    ).toThrow('absolute .json path');
  });

  it('projects evaluations and nested timings through exact allowlists', () => {
    const sanitized = sanitizeEvaluation({
      id: 'safe-id',
      category: 'safe-category',
      band: 'ambiguous',
      status: 'DETECTED',
      approved: true,
      confidence: 0.9,
      source: 'LLM',
      calls: 1,
      correct: true,
      regression: false,
      timings: {
        simulatedExternalMs: 10,
        localOverheadMs: 2,
        fullDetectionMs: 12,
        simulatedCycleMs: 14,
        token: 'TIMING_TOKEN_SENTINEL',
        secret: 'TIMING_SECRET_SENTINEL',
      },
      chunks: [
        { id: 'private', sequence: 1, content: 'CHUNK_CONTENT_SENTINEL' },
      ],
      expectedQuestion: 'EXPECTED_QUESTION_SENTINEL',
      predictedQuestion: 'PREDICTED_QUESTION_SENTINEL',
      evidence: [
        {
          chunkId: 'private',
          sequence: 1,
          excerpt: 'EVIDENCE_SENTINEL',
        },
      ],
      prompt: 'PROMPT_SENTINEL',
      responseBody: 'RESPONSE_BODY_SENTINEL',
      credential: 'CREDENTIAL_SENTINEL',
      extra: 'EXTRA_SENTINEL',
    });

    expect(Object.keys(sanitized).sort()).toEqual([
      'band',
      'calls',
      'category',
      'confidence',
      'correct',
      'id',
      'regression',
      'source',
      'status',
      'timings',
    ]);
    expect(Object.keys(sanitized.timings).sort()).toEqual([
      'fullDetectionMs',
      'localOverheadMs',
      'simulatedCycleMs',
      'simulatedExternalMs',
    ]);
    expect(JSON.stringify(sanitized)).not.toMatch(
      /SENTINEL|chunks|question|prompt|responseBody|credential|evidence|token|secret/i,
    );
  });

  it('serializes only sanitized evaluation metadata', () => {
    const temporaryDirectory = mkdtempSync(
      join(tmpdir(), 'feat-020-quality-report-'),
    );
    const outputPath = join(temporaryDirectory, 'quality-report.json');
    let report: {
      ambiguousResults: Array<Record<string, unknown>>;
      results: Array<Record<string, unknown>>;
    };
    try {
      execFileSync(
        process.execPath,
        [
          '-r',
          'ts-node/register/transpile-only',
          'scripts/evaluate-hybrid-question-detection.ts',
        ],
        {
          cwd: resolve(__dirname, '../../..'),
          env: {
            ...process.env,
            NODE_ENV: 'test',
            FEAT020_REPORT_PATH: outputPath,
          },
          stdio: 'pipe',
        },
      );
      report = JSON.parse(readFileSync(outputPath, 'utf8')) as typeof report;
    } finally {
      rmSync(temporaryDirectory, { recursive: true, force: true });
    }
    const allowedEvaluationKeys = [
      'band',
      'calls',
      'category',
      'confidence',
      'correct',
      'id',
      'regression',
      'source',
      'status',
      'timings',
    ];

    for (const result of [...report.ambiguousResults, ...report.results]) {
      expect(Object.keys(result).sort()).toEqual(allowedEvaluationKeys);
      expect(
        Object.keys(result.timings as Record<string, unknown>).sort(),
      ).toEqual([
        'fullDetectionMs',
        'localOverheadMs',
        'simulatedCycleMs',
        'simulatedExternalMs',
      ]);
    }

    const serializedReport = JSON.stringify(report);
    expect(serializedReport).not.toContain(temporaryDirectory);
    expect(serializedReport).not.toMatch(
      /"(?:chunks|expectedQuestion|predictedQuestion|question|prompt|responseBody|rawBody|body|content|excerpt|credential|apiKey|authorization|headers|evidence|token|secret)"\s*:/i,
    );
  });
});
