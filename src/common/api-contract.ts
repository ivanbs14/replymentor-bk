export const JSON_BODY_LIMIT = '12mb';
export const URL_ENCODED_BODY_LIMIT = '64kb';
export const MAX_AUDIO_BYTES = 8 * 1024 * 1024;
export const MAX_TRANSCRIPT_CHARS = 4_000;

export const INTERVIEW_TYPES = [
  'Técnica (Coding/System Design)',
  'Comportamental (Soft Skills)',
  'Conversa com RH',
  'Cultural Fit',
] as const;

export const JOB_LEVELS = ['Júnior', 'Pleno', 'Sênior', 'Tech Lead'] as const;
export const RESPONSE_PREFERENCES = [
  'direta e curta',
  'equilibrada',
  'detalhada e didática',
] as const;
export const LLM_PROVIDERS = ['gemini', 'ollama', 'openai'] as const;
export const AUDIO_MIME_TYPES = [
  'audio/webm',
  'audio/webm;codecs=opus',
  'audio/ogg',
  'audio/mp4',
  'audio/mpeg',
  'audio/wav',
] as const;

export type InterviewType = (typeof INTERVIEW_TYPES)[number];
export type JobLevel = (typeof JOB_LEVELS)[number];
export type ResponsePreference = (typeof RESPONSE_PREFERENCES)[number];
export type LlmProvider = (typeof LLM_PROVIDERS)[number];
export type AudioMimeType = (typeof AUDIO_MIME_TYPES)[number];

export function decodedBase64Size(value: string): number {
  const normalized = value.trim();
  if (!normalized) return 0;
  const padding = normalized.endsWith('==')
    ? 2
    : normalized.endsWith('=')
      ? 1
      : 0;
  return Math.floor((normalized.length * 3) / 4) - padding;
}
