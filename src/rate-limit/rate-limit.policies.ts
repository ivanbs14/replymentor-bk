import type { RateLimitGroup, RateLimitRule } from './rate-limit.types';

export const DEFAULT_RATE_LIMIT_POLICIES = {
  auth_login_ip: [
    { limit: 10, windowSeconds: 60 },
    { limit: 30, windowSeconds: 900 },
  ],
  auth_login_account: [
    { limit: 5, windowSeconds: 900 },
    { limit: 20, windowSeconds: 86400 },
  ],
  auth_register_ip: [
    { limit: 3, windowSeconds: 900 },
    { limit: 10, windowSeconds: 86400 },
  ],
  auth_logout: [
    { limit: 10, windowSeconds: 60 },
    { limit: 60, windowSeconds: 3600 },
  ],
  read_default: [
    { limit: 60, windowSeconds: 60 },
    { limit: 600, windowSeconds: 3600 },
  ],
  context_write: [
    { limit: 10, windowSeconds: 60 },
    { limit: 60, windowSeconds: 3600 },
  ],
  session_start: [
    { limit: 5, windowSeconds: 60 },
    { limit: 30, windowSeconds: 3600 },
  ],
  transcript_text: [
    { limit: 20, windowSeconds: 60 },
    { limit: 300, windowSeconds: 3600 },
  ],
  transcript_audio: [
    { limit: 5, windowSeconds: 60 },
    { limit: 60, windowSeconds: 3600 },
  ],
  generate_response: [
    { limit: 5, windowSeconds: 60 },
    { limit: 60, windowSeconds: 3600 },
  ],
  session_end: [
    { limit: 5, windowSeconds: 60 },
    { limit: 30, windowSeconds: 3600 },
  ],
  summary_read: [
    { limit: 60, windowSeconds: 60 },
    { limit: 600, windowSeconds: 3600 },
  ],
  summary_retry: [
    { limit: 3, windowSeconds: 3600 },
    { limit: 3, windowSeconds: 86400 },
  ],
  health: [
    { limit: 120, windowSeconds: 60 },
    { limit: 2000, windowSeconds: 3600 },
  ],
} as const satisfies Record<RateLimitGroup, readonly RateLimitRule[]>;

for (const rules of Object.values(DEFAULT_RATE_LIMIT_POLICIES)) {
  rules.forEach(Object.freeze);
  Object.freeze(rules);
}
Object.freeze(DEFAULT_RATE_LIMIT_POLICIES);
