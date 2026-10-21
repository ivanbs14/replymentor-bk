import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import {
  AddTranscriptDto,
  CreateInterviewContextDto,
  GenerateResponseDto,
  SessionParamsDto,
} from './interview.dto';

describe('Interview DTO contracts', () => {
  it('normalizes valid context text and accepts canonical enums', async () => {
    const dto = plainToInstance(CreateInterviewContextDto, {
      resumeText: `  ${'a'.repeat(50)}  `,
      interviewType: 'Técnica (Coding/System Design)',
      jobLevel: 'Pleno',
      jobDescription: `  ${'b'.repeat(20)}  `,
      companyName: '  ACME  ',
      responsePreference: 'equilibrada',
    });
    expect(await validate(dto)).toEqual([]);
    expect(dto.companyName).toBe('ACME');
  });

  it('rejects missing transcript and audio', async () => {
    const errors = await validate(plainToInstance(AddTranscriptDto, {}));
    expect(
      errors.flatMap((error) => Object.keys(error.constraints ?? {})),
    ).toContain('hasTranscriptOrAudio');
  });

  it('rejects malformed and oversized Base64 before decoding', async () => {
    const malformed = await validate(
      plainToInstance(AddTranscriptDto, {
        audioBase64: '***=',
        mimeType: 'audio/webm',
      }),
    );
    expect(
      malformed.flatMap((error) => Object.keys(error.constraints ?? {})),
    ).toContain('isBase64');
    const oversized = Buffer.alloc(8 * 1024 * 1024 + 1).toString('base64');
    const errors = await validate(
      plainToInstance(AddTranscriptDto, {
        audioBase64: oversized,
        mimeType: 'audio/webm',
      }),
    );
    expect(
      errors.flatMap((error) => Object.keys(error.constraints ?? {})),
    ).toContain('maxAudioSize');
  });

  it('requires an allowed MIME whenever audio is present', async () => {
    const errors = await validate(
      plainToInstance(AddTranscriptDto, { audioBase64: 'dGVzdA==' }),
    );
    expect(errors.some((error) => error.property === 'mimeType')).toBe(true);
  });

  it('rejects invalid session IDs', async () => {
    const errors = await validate(
      plainToInstance(SessionParamsDto, { sessionId: 'not-a-cuid' }),
    );
    expect(
      errors.flatMap((error) => Object.keys(error.constraints ?? {})),
    ).toContain('isCuid');
  });

  it('validates model against the selected provider allowlist', async () => {
    process.env.OPENAI_ALLOWED_MODELS = 'gpt-approved';
    const errors = await validate(
      plainToInstance(GenerateResponseDto, {
        provider: 'openai',
        model: 'gpt-rejected',
      }),
    );
    expect(
      errors.flatMap((error) => Object.keys(error.constraints ?? {})),
    ).toContain('isAllowedModel');
    delete process.env.OPENAI_ALLOWED_MODELS;
  });
});
