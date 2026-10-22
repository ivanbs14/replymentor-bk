import { createHash } from 'node:crypto';
import { BadRequestException } from '@nestjs/common';

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function sha256(value: string | Buffer): string {
  return createHash('sha256').update(value).digest('hex');
}

function fingerprint(value: Record<string, string>): string {
  return sha256(`v1:${JSON.stringify(value)}`);
}

export function assertIdempotencyKey(value: string | undefined): string {
  if (!value || !UUID_PATTERN.test(value)) {
    throw new BadRequestException({
      code: 'VALIDATION_ERROR',
      message: 'Idempotency-Key deve ser um UUID válido.',
    });
  }
  return value.toLowerCase();
}

export function buildTranscriptFingerprint(input: {
  transcript?: string;
  audioBase64?: string;
  mimeType?: string;
}): string {
  const transcript = input.transcript?.trim();
  if (transcript) {
    return fingerprint({ source: 'manual', transcript });
  }

  return fingerprint({
    source: 'stt',
    mimeType: input.mimeType ?? '',
    audioSha256: sha256(Buffer.from(input.audioBase64 ?? '', 'base64')),
  });
}

export function buildGenerationFingerprint(input: {
  forceQuestion?: string;
  provider: string;
  model: string;
}): string {
  return fingerprint({
    forceQuestion: input.forceQuestion?.trim() ?? '',
    provider: input.provider,
    model: input.model,
  });
}
