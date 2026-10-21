import {
  registerDecorator,
  type ValidationArguments,
  type ValidationOptions,
} from 'class-validator';
import {
  decodedBase64Size,
  MAX_AUDIO_BYTES,
  type LlmProvider,
} from './api-contract';

const BASE64_PATTERN = /^[A-Za-z0-9+/]+={0,2}$/;
function containsControlCharacter(value: string): boolean {
  return [...value].some((character) => {
    const code = character.charCodeAt(0);
    return (
      code === 127 || (code <= 31 && code !== 9 && code !== 10 && code !== 13)
    );
  });
}

export function IsStrictBase64(options?: ValidationOptions) {
  return (target: object, propertyName: string) =>
    registerDecorator({
      name: 'isBase64',
      target: target.constructor,
      propertyName,
      options,
      validator: {
        validate(value: unknown) {
          return (
            typeof value === 'string' &&
            value.length > 0 &&
            value.length % 4 === 0 &&
            BASE64_PATTERN.test(value)
          );
        },
      },
    });
}

export function IsCuid(options?: ValidationOptions) {
  return (target: object, propertyName: string) =>
    registerDecorator({
      name: 'isCuid',
      target: target.constructor,
      propertyName,
      options,
      validator: {
        validate: (value: unknown) =>
          typeof value === 'string' && /^c[a-z0-9]{24}$/.test(value),
      },
    });
}

export function IsAudioWithinLimit(options?: ValidationOptions) {
  return (target: object, propertyName: string) =>
    registerDecorator({
      name: 'maxAudioSize',
      target: target.constructor,
      propertyName,
      options,
      validator: {
        validate(value: unknown) {
          return (
            typeof value === 'string' &&
            decodedBase64Size(value) <= MAX_AUDIO_BYTES
          );
        },
      },
    });
}

export function HasNoControlCharacters(options?: ValidationOptions) {
  return (target: object, propertyName: string) =>
    registerDecorator({
      name: 'noControlCharacters',
      target: target.constructor,
      propertyName,
      options,
      validator: {
        validate: (value: unknown) =>
          typeof value === 'string' && !containsControlCharacter(value),
      },
    });
}

export function HasTranscriptOrAudio(options?: ValidationOptions) {
  return (target: object, propertyName: string) =>
    registerDecorator({
      name: 'hasTranscriptOrAudio',
      target: target.constructor,
      propertyName,
      options,
      validator: {
        validate(_value: unknown, args: ValidationArguments) {
          const input = args.object as {
            transcript?: string;
            audioBase64?: string;
          };
          return Boolean(input.transcript || input.audioBase64);
        },
      },
    });
}

export function IsAllowedProviderModel(options?: ValidationOptions) {
  return (target: object, propertyName: string) =>
    registerDecorator({
      name: 'isAllowedModel',
      target: target.constructor,
      propertyName,
      options,
      validator: {
        validate(value: unknown, args: ValidationArguments) {
          if (typeof value !== 'string') return false;
          const input = args.object as { provider?: LlmProvider };
          const provider =
            input.provider ??
            (process.env.LLM_PROVIDER as LlmProvider | undefined) ??
            'gemini';
          const prefix =
            provider === 'openai'
              ? 'OPENAI'
              : provider === 'ollama'
                ? 'OLLAMA'
                : 'GEMINI';
          const configured = process.env[`${prefix}_MODEL`]?.trim();
          const defaultModel =
            provider === 'openai'
              ? 'gpt-4.1-mini'
              : provider === 'ollama'
                ? 'llama3.1:8b'
                : 'gemini-2.0-flash';
          const allowed = process.env[`${prefix}_ALLOWED_MODELS`]
            ?.split(',')
            .map((model) => model.trim())
            .filter(Boolean);
          return (
            allowed?.length ? allowed : [configured ?? defaultModel]
          ).includes(value);
        },
      },
    });
}
