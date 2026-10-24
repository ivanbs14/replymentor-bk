import {
  detectLatestQuestion,
  DeterministicQuestionDetectionEvidence,
  QuestionDetectionInputChunk,
} from './deterministic-question-detector';
import {
  DetectionAdapterOutcome,
  LlmQuestionDetectionOutput,
  LlmQuestionDetector,
  QuestionDetectionAdapterError,
} from './llm-question-detector.types';
import type { QuestionDetectionConfig } from './question-detection.config';

export const HYBRID_QUESTION_DETECTOR_VERSION = 'hybrid-v1';

export type HybridDetectionOutcome =
  | DetectionAdapterOutcome
  | 'invalid_candidate'
  | 'untraceable'
  | 'low_confidence';

export type HybridQuestionDetectionResult = {
  status: 'DETECTED' | 'NOT_FOUND';
  question: string | null;
  confidence: number;
  evidence: DeterministicQuestionDetectionEvidence[];
  source: 'DETERMINISTIC' | 'LLM';
  detectorVersion: 'deterministic-v1' | typeof HYBRID_QUESTION_DETECTOR_VERSION;
  provider?: 'gemini';
  model?: string;
  approved: boolean;
};

type EvidenceReference = { chunkId: string; sequence: number };
type OriginalOffset = { start: number; end: number };

export function normalizeTraceableText(value: string): string {
  return value
    .normalize('NFC')
    .toLocaleLowerCase('pt-BR')
    .replace(/\s+/g, ' ')
    .replace(/^[\s.!?]+|[\s.!?]+$/g, '');
}

/** Keep UTF-16 offsets into the original text through normalization. */
function normalizeWithOffsets(value: string): {
  text: string;
  offsets: OriginalOffset[];
} {
  let nfc = '';
  const nfcOffsets: OriginalOffset[] = [];
  const segmenter = new Intl.Segmenter('pt-BR', { granularity: 'grapheme' });
  for (const { segment, index } of segmenter.segment(value)) {
    const normalized = segment.normalize('NFC');
    nfc += normalized;
    for (let i = 0; i < normalized.length; i += 1) {
      nfcOffsets.push({ start: index, end: index + segment.length });
    }
  }

  // Lowercase the entire string to preserve contextual Unicode casing. The
  // per-code-point lengths associate any expanded lowercase units with their
  // original grapheme (for example U+0130 -> i + combining dot).
  const lower = nfc.toLocaleLowerCase('pt-BR');
  const lowerOffsets: OriginalOffset[] = [];
  let nfcIndex = 0;
  for (const point of nfc) {
    for (let i = 0; i < point.toLocaleLowerCase('pt-BR').length; i += 1) {
      lowerOffsets.push(nfcOffsets[nfcIndex]);
    }
    nfcIndex += point.length;
  }

  let collapsed = '';
  const offsets: OriginalOffset[] = [];
  for (let index = 0; index < lower.length; index += 1) {
    const point = lower[index];
    if (/\s/.test(point)) {
      if (collapsed.endsWith(' ')) {
        offsets[offsets.length - 1].end = lowerOffsets[index].end;
      } else {
        collapsed += ' ';
        offsets.push({ ...lowerOffsets[index] });
      }
    } else {
      collapsed += point;
      offsets.push({ ...lowerOffsets[index] });
    }
  }
  const leading = collapsed.match(/^[\s.!?]+/)?.[0].length ?? 0;
  const trailing = collapsed.match(/[\s.!?]+$/)?.[0].length ?? 0;
  const end = Math.max(leading, collapsed.length - trailing);
  return {
    text: collapsed.slice(leading, end),
    offsets: offsets.slice(leading, end),
  };
}

/** Resolve only the explicitly identified chunk, choosing its first match. */
export function reconstructTraceableEvidence(
  question: string,
  chunks: QuestionDetectionInputChunk[],
  reference: EvidenceReference,
): DeterministicQuestionDetectionEvidence | null {
  if (!question || question.length > 240) return null;
  const normalizedQuestion = normalizeTraceableText(question);
  if (!normalizedQuestion) return null;
  const chunk = chunks.find(
    (item) =>
      item.id === reference.chunkId && item.sequence === reference.sequence,
  );
  if (!chunk) return null;

  const { text, offsets } = normalizeWithOffsets(chunk.content);
  const position = text.indexOf(normalizedQuestion);
  if (position < 0) return null;
  const start = offsets[position].start;
  const requiredEnd = offsets[position + normalizedQuestion.length - 1].end;
  if (requiredEnd - start > 240) return null;

  // Include the source's peripheral punctuation, never provider-supplied text.
  const punctuation =
    chunk.content.slice(requiredEnd).match(/^\s*[.!?]+/)?.[0].length ?? 0;
  const end = Math.min(requiredEnd + punctuation, start + 240);
  return {
    chunkId: chunk.id,
    sequence: chunk.sequence,
    excerpt: chunk.content.slice(start, end),
  };
}

function exactKeys(value: object, keys: string[]): boolean {
  const actual = Object.keys(value);
  return (
    actual.length === keys.length && keys.every((key) => actual.includes(key))
  );
}

function validLlmOutput(
  value: unknown,
  model: string,
): value is LlmQuestionDetectionOutput {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  if (
    !exactKeys(value, [
      'status',
      'question',
      'confidence',
      'evidence',
      'provider',
      'model',
      'adapterVersion',
    ])
  ) {
    return false;
  }
  const output = value as LlmQuestionDetectionOutput;
  if (
    output.provider !== 'gemini' ||
    output.model !== model ||
    output.adapterVersion !== 'llm-v1' ||
    !Number.isFinite(output.confidence) ||
    output.confidence < 0 ||
    output.confidence > 1 ||
    !Array.isArray(output.evidence)
  ) {
    return false;
  }
  if (output.status === 'NOT_FOUND') {
    return (
      output.question === null &&
      output.confidence < 0.7 &&
      output.evidence.length === 0
    );
  }
  if (
    output.status !== 'DETECTED' ||
    typeof output.question !== 'string' ||
    !normalizeTraceableText(output.question) ||
    output.question.length > 240 ||
    output.evidence.length !== 1
  ) {
    return false;
  }
  const reference = output.evidence[0];
  return (
    !!reference &&
    typeof reference === 'object' &&
    exactKeys(reference, ['chunkId', 'sequence']) &&
    typeof reference.chunkId === 'string' &&
    Number.isInteger(reference.sequence)
  );
}

/** Pure decision orchestration: no persistence, generation, or automatic retry. */
export class HybridQuestionDetector {
  constructor(
    private readonly llm: LlmQuestionDetector,
    private readonly config: Pick<QuestionDetectionConfig, 'model'>,
    private readonly reportOutcome: (
      outcome: HybridDetectionOutcome,
    ) => void = () => undefined,
    private readonly reportDuration: (
      outcome: HybridDetectionOutcome,
      durationMs: number,
    ) => void = () => undefined,
  ) {}

  async detect(
    chunks: QuestionDetectionInputChunk[],
    deterministicResult = detectLatestQuestion(chunks),
  ): Promise<HybridQuestionDetectionResult> {
    const startedAt = performance.now();
    const complete = (
      result: HybridQuestionDetectionResult,
      outcome: HybridDetectionOutcome,
    ): HybridQuestionDetectionResult => {
      this.reportDuration(outcome, performance.now() - startedAt);
      return result;
    };
    const fallback: HybridQuestionDetectionResult = {
      ...deterministicResult,
      source: 'DETERMINISTIC',
      approved: false,
    };
    if (deterministicResult.confidence >= 0.85) {
      return complete(
        {
          ...fallback,
          approved:
            deterministicResult.status === 'DETECTED' &&
            !!deterministicResult.question,
        },
        'detected',
      );
    }
    if (deterministicResult.confidence < 0.5) {
      return complete(
        { ...fallback, status: 'NOT_FOUND', question: null, evidence: [] },
        'not_found',
      );
    }
    const candidate = deterministicResult.question;
    const reference = deterministicResult.evidence[0];
    if (
      !Number.isFinite(deterministicResult.confidence) ||
      deterministicResult.status !== 'DETECTED' ||
      typeof candidate !== 'string' ||
      deterministicResult.evidence.length !== 1 ||
      !reference ||
      !reconstructTraceableEvidence(candidate, chunks, reference)
    ) {
      this.reportOutcome('invalid_candidate');
      return complete(fallback, 'invalid_candidate');
    }

    let output: LlmQuestionDetectionOutput;
    try {
      output = await this.llm.detect({
        chunks,
        deterministicCandidate: candidate,
        deterministicConfidence: deterministicResult.confidence,
        provider: 'gemini',
        model: this.config.model,
      });
    } catch (error: unknown) {
      if (!(error instanceof QuestionDetectionAdapterError)) throw error;
      this.reportOutcome(error.outcome);
      return complete(fallback, error.outcome);
    }
    if (!validLlmOutput(output, this.config.model)) {
      this.reportOutcome('invalid_contract');
      return complete(fallback, 'invalid_contract');
    }

    const evidence =
      output.status === 'DETECTED'
        ? reconstructTraceableEvidence(
            output.question!,
            chunks,
            output.evidence[0],
          )
        : null;
    if (output.status === 'DETECTED' && !evidence) {
      this.reportOutcome('untraceable');
      return complete(fallback, 'untraceable');
    }
    const approved = output.status === 'DETECTED' && output.confidence >= 0.7;
    this.reportOutcome(
      output.status === 'NOT_FOUND'
        ? 'not_found'
        : approved
          ? 'detected'
          : 'low_confidence',
    );
    const outcome =
      output.status === 'NOT_FOUND'
        ? 'not_found'
        : approved
          ? 'detected'
          : 'low_confidence';
    return complete(
      {
        status: output.status,
        question: output.question,
        confidence: output.confidence,
        evidence: evidence ? [evidence] : [],
        source: 'LLM',
        detectorVersion: HYBRID_QUESTION_DETECTOR_VERSION,
        provider: output.provider,
        model: output.model,
        approved,
      },
      outcome,
    );
  }
}
