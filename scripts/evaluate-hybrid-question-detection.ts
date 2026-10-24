import { Logger } from '@nestjs/common';
import assert from 'node:assert/strict';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { arch, cpus, platform, release } from 'node:os';
import { resolve } from 'node:path';
import { performance } from 'node:perf_hooks';
import { detectLatestQuestion } from '../src/interview/question-detection/deterministic-question-detector';
import { GeminiQuestionDetector } from '../src/interview/question-detection/gemini-question-detector';
import {
  HybridQuestionDetector,
  normalizeTraceableText,
  reconstructTraceableEvidence,
} from '../src/interview/question-detection/hybrid-question-detector';
import { QuestionDetectionConfig } from '../src/interview/question-detection/question-detection.config';

type CorpusCase = {
  id: string;
  category: string;
  chunks: string[];
  expectedQuestion: string | null;
};
type Fixture = {
  id: string;
  status: 'DETECTED' | 'NOT_FOUND';
  question: string | null;
  confidence: number;
  evidence: Array<{ chunkId: string; sequence: number }>;
};
type Band = 'direct' | 'ambiguous' | 'notFound';
type Timings = {
  simulatedExternalMs: number;
  localOverheadMs: number;
  fullDetectionMs: number;
  simulatedCycleMs: number;
};

const WARM_UP = 100;
const MEASUREMENTS = 1_000;
const originalFetch = globalThis.fetch;
const originalSetTimeout = globalThis.setTimeout;
const originalClearTimeout = globalThis.clearTimeout;
const corpus = JSON.parse(
  readFileSync(resolve('test/fixtures/question-detection-corpus.json'), 'utf8'),
) as CorpusCase[];
const fixtures = JSON.parse(
  readFileSync(
    resolve('test/fixtures/question-detection-llm-corpus.json'),
    'utf8',
  ),
) as Fixture[];

function chunksFor(item: CorpusCase) {
  return item.chunks.map((content, index) => ({
    id: `${item.id}-chunk-${index + 1}`,
    sequence: index + 1,
    content,
  }));
}

function bandFor(confidence: number): Band {
  return confidence >= 0.85
    ? 'direct'
    : confidence >= 0.5
      ? 'ambiguous'
      : 'notFound';
}

function normalized(value: string | null): string | null {
  return value === null ? null : normalizeTraceableText(value);
}

function exactKeys(value: object, keys: string[]): boolean {
  return (
    JSON.stringify(Object.keys(value).sort()) === JSON.stringify(keys.sort())
  );
}

function validateFixtures(): Map<string, Fixture> {
  assert.equal(
    corpus.length,
    120,
    'Base corpus must contain exactly 120 cases',
  );
  assert.equal(new Set(corpus.map((item) => item.id)).size, corpus.length);
  const ambiguous = corpus.filter(
    (item) =>
      bandFor(detectLatestQuestion(chunksFor(item)).confidence) === 'ambiguous',
  );
  assert.equal(
    ambiguous.length,
    27,
    'Current ambiguous band must contain 27 IDs',
  );
  assert.equal(
    fixtures.length,
    27,
    'Exactly 27 reviewed LLM fixtures are required',
  );
  const byId = new Map(fixtures.map((item) => [item.id, item]));
  assert.equal(byId.size, fixtures.length, 'Fixture IDs must be unique');
  assert.deepEqual(
    [...byId.keys()].sort(),
    ambiguous.map((item) => item.id).sort(),
  );
  for (const item of ambiguous) {
    const fixture = byId.get(item.id)!;
    assert.ok(
      exactKeys(fixture, [
        'id',
        'status',
        'question',
        'confidence',
        'evidence',
      ]),
    );
    assert.ok(Number.isFinite(fixture.confidence));
    assert.ok(fixture.confidence >= 0 && fixture.confidence <= 1);
    if (fixture.status === 'NOT_FOUND') {
      assert.equal(fixture.question, null);
      assert.ok(fixture.confidence < 0.7);
      assert.deepEqual(fixture.evidence, []);
    } else {
      assert.equal(fixture.status, 'DETECTED');
      assert.equal(typeof fixture.question, 'string');
      assert.ok(
        fixture.question!.length > 0 && fixture.question!.length <= 240,
      );
      assert.equal(fixture.evidence.length, 1);
      assert.ok(exactKeys(fixture.evidence[0], ['chunkId', 'sequence']));
      assert.ok(
        reconstructTraceableEvidence(
          fixture.question!,
          chunksFor(item),
          fixture.evidence[0],
        ),
        `${item.id}: fixture must select a literal segment in its referenced chunk`,
      );
    }
    assert.equal(
      normalized(fixture.question),
      normalized(item.expectedQuestion),
    );
  }
  return byId;
}

function makeConfig(timeoutMs = 1500): QuestionDetectionConfig {
  // This executable is wholly offline; never inherit a real API credential/model.
  process.env.GEMINI_API_KEY = 'offline-fixture-key';
  process.env.QUESTION_DETECTION_MODEL = 'gemini-2.0-flash';
  process.env.QUESTION_DETECTION_ALLOWED_MODELS = 'gemini-2.0-flash';
  process.env.QUESTION_DETECTION_TIMEOUT_MS = String(timeoutMs);
  return new QuestionDetectionConfig();
}

function envelope(wire: unknown): string {
  return JSON.stringify({
    candidates: [{ content: { parts: [{ text: JSON.stringify(wire) }] } }],
  });
}

function wireFixture(fixture: Fixture) {
  return {
    status: fixture.status,
    question: fixture.question,
    confidence: fixture.confidence,
    evidence: fixture.evidence,
  };
}

async function runCase(item: CorpusCase, byId: Map<string, Fixture>) {
  let calls = 0;
  let simulatedExternalMs = 0;
  const fixture = byId.get(item.id);
  const body = fixture ? envelope(wireFixture(fixture)) : '';
  globalThis.fetch = (_url: unknown, init?: RequestInit): Promise<Response> => {
    calls += 1;
    assert.ok(
      fixture,
      `${item.id}: direct/NOT_FOUND cases must not call Gemini`,
    );
    // Resolve by the opaque chunk ID actually sent to the production adapter.
    const requestBody = init?.body;
    assert.ok(typeof requestBody === 'string');
    const payload = JSON.stringify(JSON.parse(requestBody));
    assert.ok(payload.includes(`${item.id}-chunk-1`));
    const startedAt = performance.now();
    const response = new Response(body, { status: 200 });
    const readText = response.text.bind(response) as () => Promise<string>;
    response.text = async () => {
      const text = await readText();
      simulatedExternalMs += performance.now() - startedAt;
      return text;
    };
    return Promise.resolve(response);
  };
  const config = makeConfig();
  const hybrid = new HybridQuestionDetector(
    new GeminiQuestionDetector(config),
    config,
  );
  const cycleStart = performance.now();
  const deterministic = detectLatestQuestion(chunksFor(item));
  const detectionStart = performance.now();
  const result = await hybrid.detect(chunksFor(item), deterministic);
  const finishedAt = performance.now();
  const fullDetectionMs = finishedAt - detectionStart;
  const timings: Timings = {
    simulatedExternalMs,
    localOverheadMs: Math.max(0, fullDetectionMs - simulatedExternalMs),
    fullDetectionMs,
    simulatedCycleMs: finishedAt - cycleStart,
  };
  const band = bandFor(deterministic.confidence);
  assert.equal(
    calls,
    band === 'ambiguous' ? 1 : 0,
    `${item.id}: conditional single call`,
  );
  const finalQuestion = result.approved ? result.question : null;
  const regression =
    band !== 'ambiguous' &&
    (result.status !== deterministic.status ||
      result.question !== deterministic.question ||
      result.confidence !== deterministic.confidence ||
      JSON.stringify(result.evidence) !==
        JSON.stringify(deterministic.evidence));
  return {
    id: item.id,
    category: item.category,
    band,
    expectedQuestion: item.expectedQuestion,
    predictedQuestion: finalQuestion,
    status: result.status,
    approved: result.approved,
    confidence: result.confidence,
    source: result.source,
    evidence: result.evidence,
    chunks: chunksFor(item),
    calls,
    correct: normalized(finalQuestion) === normalized(item.expectedQuestion),
    regression,
    timings,
  };
}

type Evaluation = Awaited<ReturnType<typeof runCase>>;

type TraceableEvaluation = {
  expectedQuestion: string | null;
  predictedQuestion: string | null;
  calls: number;
  correct: boolean;
  regression: boolean;
  evidence: Array<{ chunkId: string; sequence: number }>;
  band?: Band;
  chunks: Array<{ id: string; sequence: number; content: string }>;
};

type LatencyMetric = ReturnType<typeof latencySummary>;
type QualityLatency = {
  localOverheadMs: LatencyMetric;
  simulatedCycleMs: LatencyMetric;
  [key: string]: LatencyMetric;
};

type ReliabilityScenario = {
  passed: boolean;
  calls: number;
  abortedAtMs?: number | null;
  configuredTimeoutMs?: number;
};

function metrics(items: Evaluation[]) {
  const truePositive = items.filter(
    (item) => item.expectedQuestion !== null && item.predictedQuestion !== null,
  ).length;
  const falsePositive = items.filter(
    (item) => item.expectedQuestion === null && item.predictedQuestion !== null,
  ).length;
  const falseNegative = items.filter(
    (item) => item.expectedQuestion !== null && item.predictedQuestion === null,
  ).length;
  const trueNegative =
    items.length - truePositive - falsePositive - falseNegative;
  const precision = truePositive / Math.max(1, truePositive + falsePositive);
  const recall = truePositive / Math.max(1, truePositive + falseNegative);
  return {
    total: items.length,
    correct: items.filter((item) => item.correct).length,
    normalizedAccuracy:
      items.filter((item) => item.correct).length / Math.max(1, items.length),
    precision,
    recall,
    f1: (2 * precision * recall) / Math.max(Number.EPSILON, precision + recall),
    truePositive,
    falsePositive,
    falseNegative,
    trueNegative,
    escalations: items.filter((item) => item.calls > 0).length,
    regressions: items.filter((item) => item.regression).length,
  };
}

function latencySummary(values: number[]) {
  const sorted = [...values].sort((left, right) => left - right);
  return {
    samples: values.length,
    p50Ms: sorted[Math.max(0, Math.ceil(sorted.length * 0.5) - 1)] ?? 0,
    p95Ms: sorted[Math.max(0, Math.ceil(sorted.length * 0.95) - 1)] ?? 0,
    maxMs: sorted.at(-1) ?? 0,
  };
}

export function buildQualitySummary(
  evaluations: TraceableEvaluation[],
  latency: QualityLatency,
  timeouts: ReliabilityScenario[],
  failures: ReliabilityScenario[],
) {
  const overall = metrics(evaluations as Evaluation[]);
  const hasBandData = evaluations.some((item) => item.band !== undefined);
  const byBand = Object.fromEntries(
    (['direct', 'ambiguous', 'notFound'] as const).map((band) => [
      band,
      metrics(evaluations.filter((item) => item.band === band) as Evaluation[]),
    ]),
  );
  const llmCallRate =
    evaluations.filter((item) => item.calls > 0).length /
    Math.max(1, evaluations.length);
  const noInventedQuestion = evaluations.every((item) => {
    if (item.predictedQuestion === null) return true;
    return item.evidence.some((evidence) =>
      reconstructTraceableEvidence(
        item.predictedQuestion!,
        item.chunks,
        evidence,
      ),
    );
  });
  const gates = {
    accuracy: overall.normalizedAccuracy >= 0.9,
    normalizedAccuracy: overall.normalizedAccuracy >= 0.9,
    f1: overall.f1 >= 0.9,
    trueNegatives: overall.trueNegative > 0,
    noInventedQuestion,
    additionalDetectionP95: latency.localOverheadMs.p95Ms <= 50,
    directBaseline:
      !hasBandData ||
      (byBand.direct.total === 78 && byBand.direct.regressions === 0),
    notFoundBaseline:
      !hasBandData ||
      (byBand.notFound.total === 15 && byBand.notFound.regressions === 0),
    ambiguousIds: !hasBandData || byBand.ambiguous.total === 27,
    escalationRate: !hasBandData || llmCallRate === 0.225,
    singleCall: evaluations.every(
      (item) =>
        item.calls ===
          (item.band === undefined || item.band === 'ambiguous' ? 1 : 0) ||
        (item.band === undefined && item.calls === 0),
    ),
    localOverhead: latency.localOverheadMs.p95Ms <= 50,
    timeoutBoundaryAndNoRetry: timeouts.every(
      (item) =>
        item.passed &&
        item.calls === 1 &&
        (item.configuredTimeoutMs === undefined ||
          item.abortedAtMs === item.configuredTimeoutMs),
    ),
    failureConfirmationAndNoRetry: failures.every(
      (item) => item.passed && item.calls === 1,
    ),
  };
  return {
    metrics: { ...overall, llmCallRate, escalationRate: llmCallRate },
    latency: {
      additionalDetectionP95Ms: latency.localOverheadMs.p95Ms,
      simulatedTotalCycleP95Ms: latency.simulatedCycleMs.p95Ms,
    },
    gates,
    passed: Object.values(gates).every(Boolean),
  };
}

async function timeoutScenario(
  item: CorpusCase,
  timeoutMs: number,
  stage: 'fetch' | 'body',
) {
  let clockMs = 0;
  let calls = 0;
  let abortedAtMs: number | null = null;
  const observedAbortTime = (): number | null => abortedAtMs;
  const timers = new Map<object, { callback: () => void; deadline: number }>();
  globalThis.setTimeout = ((callback: () => void, delay: number) => {
    const handle = { unref() {} };
    timers.set(handle, { callback, deadline: clockMs + delay });
    return handle;
  }) as unknown as typeof setTimeout;
  globalThis.clearTimeout = ((handle: object) => {
    timers.delete(handle);
  }) as unknown as typeof clearTimeout;
  try {
    globalThis.fetch = (
      _url: unknown,
      init?: RequestInit,
    ): Promise<Response> => {
      calls += 1;
      const pending = new Promise<never>((_resolve, reject) => {
        init!.signal!.addEventListener(
          'abort',
          () => {
            abortedAtMs = clockMs;
            reject(new DOMException('Offline deadline', 'AbortError'));
          },
          { once: true },
        );
      });
      if (stage === 'fetch') return pending;
      const response = new Response();
      response.text = () => pending;
      return Promise.resolve(response);
    };
    const config = makeConfig(timeoutMs);
    const pending = new HybridQuestionDetector(
      new GeminiQuestionDetector(config),
      config,
    ).detect(chunksFor(item));
    // Let the fake response reach body consumption before advancing its clock.
    for (let index = 0; index < 10; index += 1) await Promise.resolve();
    assert.equal(calls, 1);
    assert.equal(timers.size, 1, 'Adapter must establish one hard deadline');
    clockMs = timeoutMs - 1;
    assert.equal(observedAbortTime(), null);
    clockMs = timeoutMs;
    for (const [handle, timer] of [...timers]) {
      assert.equal(timer.deadline, timeoutMs);
      timers.delete(handle);
      timer.callback();
    }
    const result = await pending;
    assert.equal(observedAbortTime(), timeoutMs);
    assert.equal(result.approved, false);
    assert.equal(result.source, 'DETERMINISTIC');
    assert.equal(calls, 1, 'Timeout must not retry');
    assert.equal(timers.size, 0);
    return {
      outcome: 'timeout',
      stage,
      configuredTimeoutMs: timeoutMs,
      abortedAtMs: observedAbortTime(),
      calls,
      passed: true,
    };
  } finally {
    globalThis.setTimeout = originalSetTimeout;
    globalThis.clearTimeout = originalClearTimeout;
  }
}

async function failureScenarios(item: CorpusCase, fixture: Fixture) {
  const scenarios = [
    { outcome: 'network_error', body: '', throws: true },
    { outcome: 'invalid_json', body: '{' },
    { outcome: 'invalid_envelope', body: '{}' },
    {
      outcome: 'invalid_contract',
      body: envelope({ ...wireFixture(fixture), extra: true }),
    },
    {
      outcome: 'low_confidence',
      body: envelope({ ...wireFixture(fixture), confidence: 0.69 }),
    },
    {
      outcome: 'not_found',
      body: envelope({
        status: 'NOT_FOUND',
        question: null,
        confidence: 0.1,
        evidence: [],
      }),
    },
  ];
  const results: Array<{ outcome: string; calls: number; passed: boolean }> =
    [];
  for (const scenario of scenarios) {
    let calls = 0;
    globalThis.fetch = () => {
      calls += 1;
      if (scenario.throws) throw new TypeError('Offline network failure');
      return Promise.resolve(new Response(scenario.body, { status: 200 }));
    };
    const config = makeConfig();
    const result = await new HybridQuestionDetector(
      new GeminiQuestionDetector(config),
      config,
    ).detect(chunksFor(item));
    assert.equal(
      result.approved,
      false,
      `${scenario.outcome}: must require confirmation`,
    );
    assert.equal(calls, 1, `${scenario.outcome}: must not retry`);
    results.push({ outcome: scenario.outcome, calls, passed: true });
  }
  return results;
}

async function main() {
  Logger.overrideLogger(false);
  const byId = validateFixtures();
  const evaluations: Evaluation[] = [];
  for (const item of corpus) evaluations.push(await runCase(item, byId));
  const ambiguous = corpus.filter((item) => byId.has(item.id));
  for (let iteration = 0; iteration < WARM_UP; iteration += 1) {
    await runCase(ambiguous[iteration % ambiguous.length], byId);
  }
  const measurements: Timings[] = [];
  for (let iteration = 0; iteration < MEASUREMENTS; iteration += 1) {
    measurements.push(
      (await runCase(ambiguous[iteration % ambiguous.length], byId)).timings,
    );
  }
  const timeouts: Array<Awaited<ReturnType<typeof timeoutScenario>>> = [];
  for (const timeoutMs of [250, 1000, 1500]) {
    for (const stage of ['fetch', 'body'] as const) {
      timeouts.push(await timeoutScenario(ambiguous[0], timeoutMs, stage));
    }
  }
  const failures = await failureScenarios(
    ambiguous[0],
    byId.get(ambiguous[0].id)!,
  );
  const overall = metrics(evaluations);
  const byBand = Object.fromEntries(
    (['direct', 'ambiguous', 'notFound'] as const).map((band) => [
      band,
      metrics(evaluations.filter((item) => item.band === band)),
    ]),
  );
  const byCategory = Object.fromEntries(
    [...new Set(corpus.map((item) => item.category))].map((category) => [
      category,
      metrics(evaluations.filter((item) => item.category === category)),
    ]),
  );
  const latency = Object.fromEntries(
    (Object.keys(measurements[0]) as Array<keyof Timings>).map((key) => [
      key,
      latencySummary(measurements.map((item) => item[key])),
    ]),
  ) as QualityLatency;
  const summary = buildQualitySummary(evaluations, latency, timeouts, failures);
  const report = {
    detectorVersion: 'hybrid-v1',
    provider: 'gemini',
    model: 'gemini-2.0-flash',
    generatedAt: new Date().toISOString(),
    environment: {
      node: process.version,
      platform: platform(),
      release: release(),
      arch: arch(),
      cpu: cpus()[0]?.model,
    },
    scope:
      'Offline reviewed fixtures through the production Gemini adapter and hybrid orchestrator; validates contracts and routing, not remote model quality or persistence.',
    corpusSize: corpus.length,
    fixtureCount: fixtures.length,
    metrics: summary.metrics,
    byBand,
    byCategory,
    benchmark: {
      warmUp: WARM_UP,
      measurements: MEASUREMENTS,
      loadProfile:
        'serial, concurrency=1, rotating through all 27 ambiguous cases',
      successes: measurements.length,
      failures: 0,
      latency,
      simulatedCycleScope:
        'deterministic detection + Gemini adapter + hybrid decision; excludes HTTP endpoint, database and answer generation',
      remoteExternalP95TargetMs: 1500,
      endpointP95TargetMs: 6000,
      remoteAndEndpointMeasurement:
        'not measured; informational operational targets requiring a separate manual remote run',
      failureLatencyPolicy:
        'Fault injections and timeouts are excluded from successful latency percentiles.',
    },
    faultInjection: {
      total: timeouts.length + failures.length,
      outcomes: Object.fromEntries(
        [
          ...new Set([...timeouts, ...failures].map((item) => item.outcome)),
        ].map((outcome) => {
          const count = [...timeouts, ...failures].filter(
            (item) => item.outcome === outcome,
          ).length;
          return [
            outcome,
            { count, rate: count / (timeouts.length + failures.length) },
          ];
        }),
      ),
      timeouts,
      failures,
      timeoutAbortRate:
        timeouts.filter((item) => item.passed).length / timeouts.length,
    },
    latency: summary.latency,
    gates: summary.gates,
    passed: summary.passed,
    ambiguousResults: evaluations
      .filter((item) => item.band === 'ambiguous')
      .map(({ chunks: _chunks, ...item }) => item),
    results: evaluations.map(({ chunks: _chunks, ...item }) => item),
  };
  mkdirSync(resolve('generated'), { recursive: true });
  const outputPath = resolve('generated/feat-020-quality-gate.json');
  writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  console.log(
    JSON.stringify(
      {
        outputPath,
        metrics: report.metrics,
        latency: report.latency,
        gates: report.gates,
        passed: report.passed,
      },
      null,
      2,
    ),
  );
  assert.ok(
    report.passed,
    'Hybrid corpus gates failed; inspect the generated report',
  );
}

if (require.main === module) {
  main()
    .catch((error: unknown) => {
      console.error(error);
      process.exitCode = 1;
    })
    .finally(() => {
      globalThis.fetch = originalFetch;
      globalThis.setTimeout = originalSetTimeout;
      globalThis.clearTimeout = originalClearTimeout;
    });
}
