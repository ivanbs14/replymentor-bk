import { Transform } from 'class-transformer';
import {
  IsIn,
  IsOptional,
  IsString,
  Length,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import {
  AUDIO_MIME_TYPES,
  INTERVIEW_TYPES,
  JOB_LEVELS,
  LLM_PROVIDERS,
  RESPONSE_PREFERENCES,
  type AudioMimeType,
  type LlmProvider,
} from '../../common/api-contract';
import {
  HasNoControlCharacters,
  HasTranscriptOrAudio,
  IsAllowedProviderModel,
  IsAudioWithinLimit,
  IsCuid,
  IsStrictBase64,
} from '../../common/validation.decorators';

const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

export class CreateInterviewContextDto {
  @Transform(trim) @IsString() @Length(50, 12_000) resumeText!: string;
  @IsIn(INTERVIEW_TYPES) interviewType!: string;
  @IsIn(JOB_LEVELS) jobLevel!: string;
  @Transform(trim) @IsString() @Length(20, 8_000) jobDescription!: string;
  @Transform(trim) @IsString() @Length(1, 120) companyName!: string;
  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(1_000)
  companySegment?: string;
  @IsIn(RESPONSE_PREFERENCES) responsePreference!: string;
  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(280)
  @HasNoControlCharacters()
  aiBehavior?: string;
}

export class StartSessionDto {
  @IsCuid() contextId!: string;
}

export class SessionParamsDto {
  @IsCuid() sessionId!: string;
}

export class AddTranscriptDto {
  @ValidateIf((input: AddTranscriptDto) => input.transcript !== undefined)
  @Transform(trim)
  @IsString()
  @Length(1, 4_000)
  transcript?: string;

  @ValidateIf((input: AddTranscriptDto) => input.audioBase64 !== undefined)
  @IsString()
  @IsStrictBase64()
  @IsAudioWithinLimit()
  audioBase64?: string;

  @ValidateIf(
    (input: AddTranscriptDto) =>
      input.audioBase64 !== undefined || input.mimeType !== undefined,
  )
  @IsIn(AUDIO_MIME_TYPES)
  mimeType?: AudioMimeType;

  @HasTranscriptOrAudio()
  private readonly inputCombination?: never;
}

export class GenerateResponseDto {
  @IsOptional()
  @Transform(trim)
  @IsString()
  @Length(1, 500)
  forceQuestion?: string;
  @IsOptional() @IsIn(LLM_PROVIDERS) provider?: LlmProvider;
  @IsOptional()
  @Transform(trim)
  @IsString()
  @IsAllowedProviderModel()
  model?: string;
}
