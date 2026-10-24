import { buildQualitySummary } from '../../../scripts/evaluate-hybrid-question-detection';

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
        additionalDetectionP95Ms: expect.any(Number),
        simulatedTotalCycleP95Ms: expect.any(Number),
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
