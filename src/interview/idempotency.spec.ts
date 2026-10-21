import { BadRequestException } from '@nestjs/common';
import {
  assertIdempotencyKey,
  buildGenerationFingerprint,
  buildTranscriptFingerprint,
} from './idempotency';

describe('interview idempotency', () => {
  it('normalizes manual transcripts and ignores audio when transcript wins', () => {
    expect(buildTranscriptFingerprint({ transcript: '  hello  ' })).toBe(
      buildTranscriptFingerprint({
        transcript: 'hello',
        audioBase64: 'ignored',
        mimeType: 'audio/webm',
      }),
    );
  });

  it('hashes decoded audio bytes', () => {
    expect(
      buildTranscriptFingerprint({
        audioBase64: 'aGVsbG8=',
        mimeType: 'audio/webm',
      }),
    ).not.toBe(
      buildTranscriptFingerprint({
        audioBase64: 'd29ybGQ=',
        mimeType: 'audio/webm',
      }),
    );
  });

  it('builds deterministic generation fingerprints', () => {
    expect(
      buildGenerationFingerprint({
        provider: 'gemini',
        model: 'gemini-2.0-flash',
      }),
    ).toBe(
      buildGenerationFingerprint({
        provider: 'gemini',
        model: 'gemini-2.0-flash',
      }),
    );
  });

  it('requires an RFC 4122 UUID idempotency key', () => {
    expect(() => assertIdempotencyKey('not-a-uuid')).toThrow(
      BadRequestException,
    );
    expect(() =>
      assertIdempotencyKey('550e8400-e29b-41d4-a716-446655440000'),
    ).not.toThrow();
  });
});
