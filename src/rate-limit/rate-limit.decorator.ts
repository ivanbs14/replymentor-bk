import { SetMetadata } from '@nestjs/common';
import type { RateLimitGroup } from './rate-limit.types';

export const RATE_LIMIT_POLICY_KEY = 'replymentor:rate-limit-policy';

export type RateLimitBinding = {
  readonly group: RateLimitGroup;
  readonly identity: 'ip' | 'account' | 'user' | 'user-session';
  readonly failMode: 'open' | 'closed';
  readonly when?: 'always' | 'audio' | 'text';
};

export const RateLimitPolicy = (...bindings: RateLimitBinding[]) =>
  SetMetadata(RATE_LIMIT_POLICY_KEY, bindings);
