import {
  Inject,
  Injectable,
  type CanActivate,
  type ExecutionContext,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request, Response } from 'express';
import { OperationalLogger } from '../observability/operational-logger';
import { RateLimitConfig } from './rate-limit.config';
import {
  RATE_LIMIT_POLICY_KEY,
  type RateLimitBinding,
} from './rate-limit.decorator';
import {
  applyRateLimitHeaders,
  RateLimitExceededException,
  RateLimitStoreUnavailableException,
} from './rate-limit.exception';
import { RateLimitKeyService } from './rate-limit-key.service';
import { RATE_LIMIT_CONFIG, RATE_LIMIT_STORE } from './rate-limit.tokens';
import {
  RateLimitStoreUnavailableError,
  type RateLimitDecision,
  type RateLimitStore,
} from './rate-limit.types';

type RateLimitedRequest = Request & {
  user?: { userId: string; email: string };
};

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @Inject(RATE_LIMIT_CONFIG) private readonly config: RateLimitConfig,
    @Inject(RATE_LIMIT_STORE) private readonly store: RateLimitStore,
    private readonly keys: RateLimitKeyService,
    private readonly logger: OperationalLogger,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const bindings = this.reflector.getAllAndOverride<
      readonly RateLimitBinding[]
    >(RATE_LIMIT_POLICY_KEY, [context.getHandler(), context.getClass()]);
    if (!bindings || bindings.length === 0) return true;

    const http = context.switchToHttp();
    const request = http.getRequest<RateLimitedRequest>();
    const response = http.getResponse<Response>();
    let selected: RateLimitDecision | null = null;

    for (const binding of bindings) {
      if (!this.matchesPayload(binding, request)) continue;
      try {
        const decision = await this.store.consume(
          `${binding.group}:${this.resolveIdentity(binding, request)}`,
          this.config.policies[binding.group],
        );
        if (!selected || this.isMoreRestrictive(decision, selected)) {
          selected = decision;
        }
        if (!decision.allowed) {
          applyRateLimitHeaders(response, decision);
          this.logger.warn({
            event: 'rate_limit_blocked',
            outcome: 'rejected',
            statusCode: 429,
            errorCode: 'RATE_LIMIT_EXCEEDED',
            method: request.method,
            route: binding.group,
            policyGroup: binding.group,
            retryBucket: this.retryBucket(decision.retryAfterSeconds),
          });
          throw new RateLimitExceededException(
            'RATE_LIMIT_EXCEEDED',
            decision.retryAfterSeconds,
          );
        }
      } catch (error) {
        if (error instanceof RateLimitExceededException) throw error;
        if (!(error instanceof RateLimitStoreUnavailableError)) throw error;
        this.logger.error({
          event: 'rate_limit_store_unavailable',
          outcome: binding.failMode,
          statusCode: 503,
          errorCode: 'RATE_LIMIT_STORE_UNAVAILABLE',
          method: request.method,
          route: binding.group,
          policyGroup: binding.group,
        });
        if (binding.failMode === 'closed') {
          throw new RateLimitStoreUnavailableException();
        }
      }
    }

    if (selected) applyRateLimitHeaders(response, selected);
    return true;
  }

  private matchesPayload(binding: RateLimitBinding, request: Request): boolean {
    if (!binding.when || binding.when === 'always') return true;
    const body: unknown = request.body;
    const hasAudio =
      typeof body === 'object' &&
      body !== null &&
      typeof Reflect.get(body, 'audioBase64') === 'string' &&
      Reflect.get(body, 'audioBase64') !== '';
    return binding.when === 'audio' ? hasAudio : !hasAudio;
  }

  private resolveIdentity(
    binding: RateLimitBinding,
    request: RateLimitedRequest,
  ): string {
    switch (binding.identity) {
      case 'ip':
        return this.keys.forIp(
          request.ip || request.socket.remoteAddress || 'unknown',
        );
      case 'account': {
        const body: unknown = request.body;
        const email =
          typeof body === 'object' &&
          body !== null &&
          typeof Reflect.get(body, 'email') === 'string'
            ? String(Reflect.get(body, 'email')).slice(0, 254)
            : 'invalid-account';
        return this.keys.forAccount(email);
      }
      case 'user':
        return request.user
          ? this.keys.forUser(request.user.userId)
          : this.keys.forIp(
              request.ip || request.socket.remoteAddress || 'unknown',
            );
      case 'user-session': {
        if (!request.user) {
          return this.keys.forIp(
            request.ip || request.socket.remoteAddress || 'unknown',
          );
        }
        const rawSessionId = request.params?.sessionId;
        const sessionId =
          typeof rawSessionId === 'string' ? rawSessionId : 'missing-session';
        return this.keys.forUserSession(request.user.userId, sessionId);
      }
    }
  }

  private isMoreRestrictive(
    candidate: RateLimitDecision,
    current: RateLimitDecision,
  ): boolean {
    return (
      candidate.remaining / candidate.limit < current.remaining / current.limit
    );
  }

  private retryBucket(seconds: number): string {
    if (seconds <= 5) return '0-5s';
    if (seconds <= 60) return '6-60s';
    if (seconds <= 900) return '1-15m';
    return '15m+';
  }
}
