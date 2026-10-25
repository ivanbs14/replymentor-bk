import type {
  SessionSummaryContent,
  SessionSummaryContext,
} from './session-summary.types';

const MAX_PAIRS = 30;
const MAX_ANSWER_CHARS = 1_500;
const MAX_CONTEXT_CHARS = 20_000;

type ContextRecord = {
  resumeText: string;
  interviewType: string;
  jobLevel: string;
  jobDescription: string;
  companyName: string;
  companySegment: string | null;
};

type ResponseRecord = {
  id: string;
  detectedQuestion: string;
  suggestedAnswer: string;
};

export function buildDeterministicSummary(responses: ResponseRecord[]): string {
  if (responses.length === 0) {
    return 'Sessão encerrada sem respostas sugeridas registradas.';
  }
  return `Sessão encerrada com ${responses.length} ${responses.length === 1 ? 'resposta sugerida' : 'respostas sugeridas'}.`;
}

export function buildSessionSummaryContext(
  context: ContextRecord,
  allResponses: ResponseRecord[],
): SessionSummaryContext {
  const responses = allResponses.slice(0, MAX_PAIRS);
  const professionalContext = {
    resumeText: compact(context.resumeText, 2_500),
    interviewType: compact(context.interviewType, 100),
    jobLevel: compact(context.jobLevel, 60),
    jobDescription: compact(context.jobDescription, 2_000),
    companyName: compact(context.companyName, 100),
    companySegment: compact(context.companySegment ?? '', 400),
  };
  const fixedLength = JSON.stringify({ professionalContext }).length;
  const questionLength = responses.reduce(
    (total, response) => total + compact(response.detectedQuestion, 400).length,
    0,
  );
  const structuralReserve = responses.length * 90 + 200;
  const answerBudget = Math.max(
    0,
    MAX_CONTEXT_CHARS - fixedLength - questionLength - structuralReserve,
  );
  const perAnswerBudget = responses.length
    ? Math.min(MAX_ANSWER_CHARS, Math.floor(answerBudget / responses.length))
    : 0;

  return {
    professionalContext,
    responses: responses.map((response) => ({
      responseId: response.id,
      question: compact(response.detectedQuestion, 400),
      answer: compact(response.suggestedAnswer, perAnswerBudget),
    })),
  };
}

export function emptySessionSummary(): SessionSummaryContent {
  return {
    overview: 'A sessão foi encerrada sem respostas registradas para análise.',
    questions: [],
    topics: [],
    strengths: [],
    improvements: [],
    nextSteps: [
      'Realizar uma nova sessão com perguntas e respostas para gerar um resumo detalhado.',
    ],
  };
}

export function parseSessionSummaryContent(
  raw: string,
  validResponseIds: ReadonlySet<string>,
): SessionSummaryContent | null {
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!isRecord(value)) return null;
  const exactKeys = [
    'overview',
    'questions',
    'topics',
    'strengths',
    'improvements',
    'nextSteps',
  ];
  if (!hasExactKeys(value, exactKeys) || !isText(value.overview, 1_200))
    return null;
  const questions = parseQuestions(value.questions);
  const topics = parseStringList(value.topics, 20, 160);
  const strengths = parseEvidenceList(value.strengths, validResponseIds);
  const improvements = parseEvidenceList(value.improvements, validResponseIds);
  const nextSteps = parseStringList(value.nextSteps, 12, 300);
  if (!questions || !topics || !strengths || !improvements || !nextSteps)
    return null;
  const evaluativeText = [
    value.overview,
    ...strengths.map((item) => item.text),
    ...improvements.map((item) => item.text),
    ...nextSteps,
  ].join(' ');
  const prohibited =
    /(?:recomend\w*.{0,40}contrat\w*|contrat\w*.{0,40}recomend\w*|\b(?:nota|pontua(?:ç|c)[aã]o|ranking)\b\s*[:=]?\s*\d)/i;
  if (prohibited.test(evaluativeText)) return null;
  return {
    overview: value.overview.trim(),
    questions,
    topics,
    strengths,
    improvements,
    nextSteps,
  };
}

function parseQuestions(value: unknown) {
  if (!Array.isArray(value) || value.length > MAX_PAIRS) return null;
  const parsed: Array<{ question: string; answerSummary: string }> = [];
  for (const item of value) {
    if (!isRecord(item) || !hasExactKeys(item, ['question', 'answerSummary']))
      return null;
    if (!isText(item.question, 500) || !isText(item.answerSummary, 1_500))
      return null;
    parsed.push({
      question: item.question.trim(),
      answerSummary: item.answerSummary.trim(),
    });
  }
  return parsed;
}

function parseEvidenceList(value: unknown, validIds: ReadonlySet<string>) {
  if (!Array.isArray(value) || value.length > 12) return null;
  const parsed: Array<{ text: string; evidenceResponseId: string }> = [];
  for (const item of value) {
    if (!isRecord(item) || !hasExactKeys(item, ['text', 'evidenceResponseId']))
      return null;
    if (!isText(item.text, 500) || typeof item.evidenceResponseId !== 'string')
      return null;
    if (!validIds.has(item.evidenceResponseId)) return null;
    parsed.push({
      text: item.text.trim(),
      evidenceResponseId: item.evidenceResponseId,
    });
  }
  return parsed;
}

function parseStringList(
  value: unknown,
  maxItems: number,
  maxLength: number,
): string[] | null {
  if (!Array.isArray(value) || value.length > maxItems) return null;
  return value.every((item) => isText(item, maxLength))
    ? value.map((item) => item.trim())
    : null;
}

function compact(value: string, maxLength: number): string {
  const normalized = value.replace(/\s+/g, ' ').trim();
  if (maxLength <= 0) return '';
  return normalized.slice(0, maxLength);
}

function isText(value: unknown, maxLength: number): value is string {
  return (
    typeof value === 'string' &&
    value.trim().length > 0 &&
    value.length <= maxLength
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function hasExactKeys(
  value: Record<string, unknown>,
  expected: string[],
): boolean {
  const actual = Object.keys(value).sort();
  return (
    actual.length === expected.length &&
    actual.every((key, index) => key === [...expected].sort()[index])
  );
}
