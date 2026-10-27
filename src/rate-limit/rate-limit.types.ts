export type RateLimitGroup =
  | 'auth_login_ip'
  | 'auth_login_account'
  | 'auth_register_ip'
  | 'auth_logout'
  | 'read_default'
  | 'context_write'
  | 'session_start'
  | 'transcript_text'
  | 'transcript_audio'
  | 'generate_response'
  | 'session_end'
  | 'summary_read'
  | 'summary_retry'
  | 'health';

export type RateLimitRule = {
  readonly limit: number;
  readonly windowSeconds: number;
};

export type RateLimitDecision = {
  readonly allowed: boolean;
  readonly limit: number;
  readonly remaining: number;
  readonly resetEpochSeconds: number;
  readonly retryAfterSeconds: number;
};

export interface RateLimitStore {
  consume(
    key: string,
    rules: readonly RateLimitRule[],
  ): Promise<RateLimitDecision>;
  acquireLease(key: string, token: string, ttlMs: number): Promise<boolean>;
  releaseLease(key: string, token: string): Promise<void>;
}
