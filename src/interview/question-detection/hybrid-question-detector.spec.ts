import {
  DeterministicQuestionDetectionResult,
  QuestionDetectionInputChunk,
} from './deterministic-question-detector';
import {
  HybridQuestionDetector,
  normalizeTraceableText,
  reconstructTraceableEvidence,
} from './hybrid-question-detector';
import {
  LlmQuestionDetectionOutput,
  LlmQuestionDetectionInput,
  QuestionDetectionAdapterError,
} from './llm-question-detector.types';

const question = 'Como você valida uma mudança?';
const chunk = (content = question): QuestionDetectionInputChunk => ({
  id: 'opaque-1',
  sequence: 3,
  content,
});
const deterministic = (
  confidence = 0.76,
): DeterministicQuestionDetectionResult => ({
  status: 'DETECTED',
  question,
  confidence,
  evidence: [{ chunkId: 'opaque-1', sequence: 3, excerpt: question }],
  detectorVersion: 'deterministic-v1',
});
const llmOutput = (): LlmQuestionDetectionOutput => ({
  status: 'DETECTED',
  question,
  confidence: 0.82,
  evidence: [{ chunkId: 'opaque-1', sequence: 3 }],
  provider: 'gemini',
  model: 'gemini-2.0-flash',
  adapterVersion: 'llm-v1',
});

describe('hybrid question detector', () => {
  let llm: {
    detect: jest.Mock<
      Promise<LlmQuestionDetectionOutput>,
      [LlmQuestionDetectionInput]
    >;
  };
  let report: jest.Mock;
  let hybrid: HybridQuestionDetector;

  beforeEach(() => {
    llm = {
      detect: jest
        .fn<Promise<LlmQuestionDetectionOutput>, [LlmQuestionDetectionInput]>()
        .mockResolvedValue(llmOutput()),
    };
    report = jest.fn();
    hybrid = new HybridQuestionDetector(
      llm,
      { model: 'gemini-2.0-flash' },
      report,
    );
  });

  it.each([0.85, 1])('uses direct confidence %s without LLM', async (value) => {
    expect(await hybrid.detect([chunk()], deterministic(value))).toMatchObject({
      ...deterministic(value),
      source: 'DETERMINISTIC',
      approved: true,
    });
    expect(llm.detect).not.toHaveBeenCalled();
  });

  it('returns NOT_FOUND below the ambiguous band without LLM', async () => {
    expect(await hybrid.detect([chunk()], deterministic(0.49))).toMatchObject({
      status: 'NOT_FOUND',
      question: null,
      source: 'DETERMINISTIC',
      approved: false,
    });
    expect(llm.detect).not.toHaveBeenCalled();
  });

  it.each([0.5, 0.849])(
    'escalates confidence %s exactly once',
    async (value) => {
      const result = await hybrid.detect([chunk()], deterministic(value));
      expect(result).toMatchObject({
        status: 'DETECTED',
        question,
        confidence: 0.82,
        source: 'LLM',
        detectorVersion: 'hybrid-v1',
        provider: 'gemini',
        model: 'gemini-2.0-flash',
        approved: true,
        evidence: [{ chunkId: 'opaque-1', sequence: 3, excerpt: question }],
      });
      expect(llm.detect).toHaveBeenCalledTimes(1);
      expect(llm.detect).toHaveBeenCalledWith({
        chunks: [chunk()],
        deterministicCandidate: question,
        deterministicConfidence: value,
        provider: 'gemini',
        model: 'gemini-2.0-flash',
      });
    },
  );

  it('computes the deterministic stage when omitted', async () => {
    const result = await hybrid.detect([chunk('como você valida uma mudança')]);
    expect(result.approved).toBe(true);
    expect(llm.detect).toHaveBeenCalledTimes(1);
  });

  it.each([0.69, 0.7])(
    'applies final confidence threshold %s',
    async (value) => {
      llm.detect.mockResolvedValue({ ...llmOutput(), confidence: value });
      expect(await hybrid.detect([chunk()], deterministic())).toMatchObject({
        source: 'LLM',
        confidence: value,
        approved: value >= 0.7,
      });
    },
  );

  it('persists a valid LLM NOT_FOUND decision', async () => {
    llm.detect.mockResolvedValue({
      ...llmOutput(),
      status: 'NOT_FOUND',
      question: null,
      confidence: 0.2,
      evidence: [],
    });
    expect(await hybrid.detect([chunk()], deterministic())).toMatchObject({
      status: 'NOT_FOUND',
      source: 'LLM',
      question: null,
      approved: false,
      detectorVersion: 'hybrid-v1',
    });
  });

  it.each(['timeout', 'network_error', 'invalid_json'] as const)(
    'preserves the ambiguous detection on sanitized %s with no retry',
    async (outcome) => {
      llm.detect.mockRejectedValue(new QuestionDetectionAdapterError(outcome));
      expect(await hybrid.detect([chunk()], deterministic())).toEqual({
        ...deterministic(),
        source: 'DETERMINISTIC',
        approved: false,
      });
      expect(llm.detect).toHaveBeenCalledTimes(1);
      expect(report).toHaveBeenCalledWith(outcome);
    },
  );

  it('does not swallow unexpected programming errors', async () => {
    llm.detect.mockRejectedValue(new Error('unexpected'));
    await expect(hybrid.detect([chunk()], deterministic())).rejects.toThrow(
      'unexpected',
    );
  });

  it.each([
    { question: '' },
    { question: 'Como você inventa uma mudança?' },
    { confidence: Number.NaN },
    { status: 'NOT_FOUND' },
    { evidence: [] },
    { evidence: [{ chunkId: 'other', sequence: 3, excerpt: question }] },
  ])(
    'rejects invalid deterministic candidates before LLM: %p',
    async (change) => {
      const invalid = { ...deterministic(), ...change };
      const result = await hybrid.detect(
        [chunk()],
        invalid as DeterministicQuestionDetectionResult,
      );
      expect(result.approved).toBe(false);
      expect(llm.detect).not.toHaveBeenCalled();
      expect(report).toHaveBeenCalledWith('invalid_candidate');
    },
  );

  it.each([
    { question: 'Como você inventa uma mudança?' },
    { confidence: 1.01 },
    { evidence: [{ chunkId: 'absent', sequence: 3 }] },
    { evidence: [{ chunkId: 'opaque-1', sequence: 4 }] },
    { evidence: [] },
    { provider: 'openai' },
    { model: 'other' },
    { adapterVersion: 'other' },
    { question: null },
    { extra: 'provider output must not be trusted' },
  ])('rejects invalid or untraceable LLM output: %p', async (change) => {
    llm.detect.mockResolvedValue({
      ...llmOutput(),
      ...change,
    } as LlmQuestionDetectionOutput);
    expect(await hybrid.detect([chunk()], deterministic())).toEqual({
      ...deterministic(),
      source: 'DETERMINISTIC',
      approved: false,
    });
    expect(llm.detect).toHaveBeenCalledTimes(1);
  });

  it('does not accept questions assembled from multiple chunks', async () => {
    llm.detect.mockResolvedValue({
      ...llmOutput(),
      question: 'Como você valida uma mudança? Quais testes executa?',
    });
    const result = await hybrid.detect(
      [chunk(), { id: 'other', sequence: 4, content: 'Quais testes executa?' }],
      deterministic(),
    );
    expect(result.source).toBe('DETERMINISTIC');
    expect(result.approved).toBe(false);
  });
});

describe('literal traceability', () => {
  const ref = { chunkId: 'opaque-1', sequence: 3 };

  it('allows only NFC, Portuguese case, spaces and peripheral .!?', () => {
    expect(normalizeTraceableText(' !  VOCE\u0302\tvalida? . ')).toBe(
      'você valida',
    );
    expect(normalizeTraceableText('“Você valida?”')).toBe('“você valida?”');
    expect(normalizeTraceableText('Você, valida?')).toBe('você, valida');
  });

  it('maps normalized occurrences to the original local excerpt', () => {
    const original = 'COMO\tvoce\u0302  valida uma mudança?';
    expect(
      reconstructTraceableEvidence(
        question,
        [chunk(`Antes. ${original}`)],
        ref,
      ),
    ).toEqual({ ...ref, excerpt: original });
  });

  it('chooses the first original occurrence in the explicitly referenced chunk', () => {
    const content =
      'COMO você valida uma mudança? Como você valida uma mudança?';
    expect(
      reconstructTraceableEvidence(
        question,
        [{ id: 'other', sequence: 2, content: question }, chunk(content)],
        ref,
      )?.excerpt,
    ).toBe('COMO você valida uma mudança?');
  });

  it.each([
    ['Você valida?', 'Voce valida?'],
    ['Você valida?', 'Você, valida?'],
    ['Você valida?', '“Você valida?”'],
  ])(
    'does not allow transformations beyond the contract: %s / %s',
    (q, text) => {
      // Quotes are not stripped from the question itself.
      const selected = text.includes('“') ? '“Você valida?”' : q;
      const original = text.includes('“') ? q : text;
      expect(
        reconstructTraceableEvidence(selected, [chunk(original)], ref),
      ).toBeNull();
    },
  );

  it('covers the entire question and never truncates the evidence', () => {
    const maximum = `Como ${'a'.repeat(234)}?`;
    const evidence = reconstructTraceableEvidence(
      maximum,
      [chunk(maximum)],
      ref,
    );
    expect(evidence?.excerpt).toHaveLength(240);
    expect(evidence?.excerpt).toBe(maximum);
    expect(
      reconstructTraceableEvidence(`${maximum}?`, [chunk(`${maximum}?`)], ref),
    ).toBeNull();
    expect(
      reconstructTraceableEvidence(
        'Como você valida?',
        [chunk(`Como${' '.repeat(240)}você valida?`)],
        ref,
      ),
    ).toBeNull();
  });
});
