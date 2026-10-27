import { HttpException, HttpStatus } from '@nestjs/common';
import type { RateLimitDecision } from './rate-limit.types';

export class RateLimitExceededException extends HttpException {
  constructor(
    code: 'RATE_LIMIT_EXCEEDED' | 'RATE_LIMIT_CONCURRENT_OPERATION',
    retryAfterSeconds: number,
  ) {
    super(
      {
        code,
        message:
          code === 'RATE_LIMIT_CONCURRENT_OPERATION'
            ? 'Já existe uma operação em andamento. Aguarde alguns segundos.'
            : 'Muitas solicitações. Tente novamente mais tarde.',
        retryAfterSeconds,
      },
      HttpStatus.TOO_MANY_REQUESTS,
    );
  }
}

export class RateLimitStoreUnavailableException extends HttpException {
  constructor() {
    super(
      {
        code: 'RATE_LIMIT_STORE_UNAVAILABLE',
        message: 'Serviço temporariamente indisponível.',
      },
      HttpStatus.SERVICE_UNAVAILABLE,
    );
  }
}

export function applyRateLimitHeaders(
  response: { setHeader(name: string, value: string | number): void },
  decision: RateLimitDecision,
): void {
  response.setHeader('RateLimit-Limit', decision.limit);
  response.setHeader('RateLimit-Remaining', decision.remaining);
  response.setHeader('RateLimit-Reset', decision.resetEpochSeconds);
  if (!decision.allowed) {
    response.setHeader('Retry-After', decision.retryAfterSeconds);
  }
}
