export const DETERMINISTIC_QUESTION_DETECTOR_VERSION = 'deterministic-v1';

export type QuestionDetectionInputChunk = {
  id: string;
  sequence: number;
  content: string;
};

export type DeterministicQuestionDetectionEvidence = {
  chunkId: string;
  sequence: number;
  excerpt: string;
};

export type DeterministicQuestionDetectionResult = {
  status: 'DETECTED' | 'NOT_FOUND';
  question: string | null;
  confidence: number;
  evidence: DeterministicQuestionDetectionEvidence[];
  detectorVersion: typeof DETERMINISTIC_QUESTION_DETECTOR_VERSION;
};

type Speaker = 'INTERVIEWER' | 'CANDIDATE' | 'UNKNOWN';

type Candidate = {
  question: string;
  confidence: number;
  chunk: QuestionDetectionInputChunk;
  order: number;
};

const SPEAKER_MARKER =
  /(?:^|\n|\s)(entrevistador|recrutador|candidato)\s*:\s*/gi;
const QUESTION_PREFIX =
  /^(?:como|qual|quais|o que|que|por que|porque|quando|onde|quem|quanto|quantos|quanta|quantas)\b/i;
const INTERVIEW_REQUEST_PREFIX =
  /^(?:conte|descreva|explique|fale|mostre|cite|compartilhe|d[êe]|me\s+(?:conte|explique|fale|descreva)|d[êe]\s+um\s+exemplo)\b/i;
const POLITE_REQUEST_PREFIX = /^(?:voc[êe]\s+(?:pode|poderia)|pode(?:ria)?)\b/i;
const NOISE_ONLY =
  /^(?:\[[^\]]+\]|\([^)]*\)|(?:ah|hum|hã|certo|ok|tá|sim)[\s,.!?-]*)+$/i;
const MIN_CONFIDENCE = 0.5;

function clamp(value: number): number {
  return Math.min(1, Math.max(0, Number(value.toFixed(2))));
}

function toSpeaker(label: string): Speaker {
  return label.toLocaleLowerCase('pt-BR') === 'candidato'
    ? 'CANDIDATE'
    : 'INTERVIEWER';
}

function splitUtterances(
  content: string,
): Array<{ speaker: Speaker; body: string }> {
  const markers = [...content.matchAll(SPEAKER_MARKER)];
  if (markers.length === 0) return [{ speaker: 'UNKNOWN', body: content }];

  const utterances: Array<{ speaker: Speaker; body: string }> = [];
  const prefix = content.slice(0, markers[0].index).trim();
  if (prefix) utterances.push({ speaker: 'UNKNOWN', body: prefix });
  markers.forEach((marker, index) => {
    const bodyStart = (marker.index ?? 0) + marker[0].length;
    const bodyEnd = markers[index + 1]?.index ?? content.length;
    const body = content.slice(bodyStart, bodyEnd).trim();
    if (body) utterances.push({ speaker: toSpeaker(marker[1]), body });
  });
  return utterances;
}

function segmentBody(body: string): Array<{ text: string; offset: number }> {
  const segments: Array<{ text: string; offset: number }> = [];
  const expression = /[^.!?\n]+[.!?]?/g;
  let match: RegExpExecArray | null;
  while ((match = expression.exec(body)) !== null) {
    const leadingWhitespace = match[0].length - match[0].trimStart().length;
    const text = match[0].trim();
    if (text) segments.push({ text, offset: match.index + leadingWhitespace });
    if (match[0].length === 0) expression.lastIndex += 1;
  }
  return segments;
}

function score(text: string, speaker: Speaker): number {
  const normalized = text.trim();
  if (!normalized || NOISE_ONLY.test(normalized)) return 0;

  const hasQuestionMark = normalized.endsWith('?');
  const hasQuestionPrefix = QUESTION_PREFIX.test(normalized);
  const hasInterviewRequest = INTERVIEW_REQUEST_PREFIX.test(normalized);
  const hasPoliteRequest = POLITE_REQUEST_PREFIX.test(normalized);
  if (
    !hasQuestionMark &&
    !hasQuestionPrefix &&
    !hasInterviewRequest &&
    !hasPoliteRequest
  ) {
    return 0;
  }

  let confidence = 0;
  if (hasQuestionMark) confidence = 0.86;
  if (hasQuestionPrefix) confidence = Math.max(confidence, 0.76);
  if (hasInterviewRequest) confidence = Math.max(confidence, 0.72);
  if (hasPoliteRequest) confidence = Math.max(confidence, 0.68);
  if (hasQuestionMark && (hasQuestionPrefix || hasPoliteRequest)) {
    confidence += 0.06;
  }
  if (speaker === 'INTERVIEWER') confidence += 0.13;
  if (speaker === 'CANDIDATE') confidence -= 0.55;
  if (normalized.split(/\s+/).length < 3) confidence -= 0.25;
  return clamp(confidence);
}

function excerptFor(candidate: Candidate): string {
  const raw = candidate.question;
  if (raw.length <= 240) return raw;
  return `${raw.slice(0, 237)}...`;
}

export function detectLatestQuestion(
  chunks: QuestionDetectionInputChunk[],
): DeterministicQuestionDetectionResult {
  const candidates: Candidate[] = [];
  let order = 0;

  for (const chunk of chunks) {
    for (const utterance of splitUtterances(chunk.content)) {
      for (const segment of segmentBody(utterance.body)) {
        const confidence = score(segment.text, utterance.speaker);
        if (confidence >= MIN_CONFIDENCE) {
          candidates.push({
            question: segment.text,
            confidence,
            chunk,
            order,
          });
        }
        order += 1;
      }
    }
  }

  const directCandidates = candidates.filter(
    (candidate) => candidate.confidence >= 0.85,
  );
  const selected =
    directCandidates.sort((left, right) => right.order - left.order)[0] ??
    candidates.sort(
      (left, right) =>
        right.confidence - left.confidence || right.order - left.order,
    )[0];
  if (!selected) {
    return {
      status: 'NOT_FOUND',
      question: null,
      confidence: 0,
      evidence: [],
      detectorVersion: DETERMINISTIC_QUESTION_DETECTOR_VERSION,
    };
  }

  return {
    status: 'DETECTED',
    question: selected.question,
    confidence: selected.confidence,
    evidence: [
      {
        chunkId: selected.chunk.id,
        sequence: selected.chunk.sequence,
        excerpt: excerptFor(selected),
      },
    ],
    detectorVersion: DETERMINISTIC_QUESTION_DETECTOR_VERSION,
  };
}
