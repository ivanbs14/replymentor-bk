import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { OperationalLogger } from '../observability/operational-logger';
import {
  RateLimitExceededException,
  RateLimitStoreUnavailableException,
} from './rate-limit.exception';
import { RateLimitKeyService } from './rate-limit-key.service';
import { RATE_LIMIT_STORE } from './rate-limit.tokens';
import {
  RateLimitStoreUnavailableError,
  type RateLimitStore,
} from './rate-limit.types';

@Injectable()
export class ProviderLeaseService {
  constructor(
    @Inject(RATE_LIMIT_STORE) private readonly store: RateLimitStore,
    private readonly keys: RateLimitKeyService,
    private readonly logger: OperationalLogger,
  ) {}

  async run<T>(
    input: {
      kind: 'stt' | 'generation';
      userId: string;
      sessionId: string;
      ttlMs: number;
    },
    work: () => Promise<T>,
  ): Promise<T> {
    const key = this.keys.forLease(input.kind, input.userId, input.sessionId);
    const token = randomUUID();
    let acquired: boolean;
    try {
      acquired = await this.store.acquireLease(key, token, input.ttlMs);
    } catch (error) {
      if (error instanceof RateLimitStoreUnavailableError) {
        throw new RateLimitStoreUnavailableException();
      }
      throw error;
    }
    if (!acquired) {
      throw new RateLimitExceededException(
        'RATE_LIMIT_CONCURRENT_OPERATION',
        2,
      );
    }

    try {
      return await work();
    } finally {
      try {
        await this.store.releaseLease(key, token);
      } catch {
        this.logger.error({
          event: 'rate_limit_store_unavailable',
          outcome: 'lease_release_failed',
          statusCode: 503,
          errorCode: 'RATE_LIMIT_STORE_UNAVAILABLE',
          policyGroup: input.kind,
        });
      }
    }
  }
}
