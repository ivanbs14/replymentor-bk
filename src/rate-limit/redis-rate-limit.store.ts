import { randomUUID } from 'node:crypto';
import type { RateLimitDecision, RateLimitRule } from './rate-limit.types';
import {
  RateLimitStoreUnavailableError,
  type RateLimitStore,
} from './rate-limit.types';

type EvalOptions = {
  keys: string[];
  arguments: string[];
};

export type RedisRateLimitClient = {
  eval(script: string, options: EvalOptions): Promise<unknown>;
  set(
    key: string,
    value: string,
    options: { NX: true; PX: number },
  ): Promise<string | null>;
};

const SLIDING_WINDOW_SCRIPT = String.raw`
local request_token = ARGV[1]
local rule_count = tonumber(ARGV[2])
local redis_time = redis.call('TIME')
local now_ms = tonumber(redis_time[1]) * 1000 + math.floor(tonumber(redis_time[2]) / 1000)
local counts = {}
local resets = {}
local blocked = false
local selected_limit = 0
local selected_remaining = 0
local selected_reset = 0
local selected_retry = 0
local selected_ratio = nil

for index = 1, rule_count do
  local limit = tonumber(ARGV[2 + (index - 1) * 2 + 1])
  local window_ms = tonumber(ARGV[2 + (index - 1) * 2 + 2])
  local key = KEYS[index]
  redis.call('ZREMRANGEBYSCORE', key, '-inf', now_ms - window_ms)
  local count = redis.call('ZCARD', key)
  local oldest = redis.call('ZRANGE', key, 0, 0, 'WITHSCORES')
  local reset_ms = now_ms + window_ms
  if #oldest == 2 then
    reset_ms = tonumber(oldest[2]) + window_ms
  end
  counts[index] = count
  resets[index] = reset_ms
  if count >= limit then
    blocked = true
    local retry = math.max(1, math.ceil((reset_ms - now_ms) / 1000))
    if retry > selected_retry then
      selected_limit = limit
      selected_remaining = 0
      selected_reset = math.ceil(reset_ms / 1000)
      selected_retry = retry
    end
  end
end

if blocked then
  return {0, selected_limit, selected_remaining, selected_reset, selected_retry}
end

for index = 1, rule_count do
  local limit = tonumber(ARGV[2 + (index - 1) * 2 + 1])
  local window_ms = tonumber(ARGV[2 + (index - 1) * 2 + 2])
  local key = KEYS[index]
  redis.call('ZADD', key, now_ms, tostring(now_ms) .. ':' .. request_token)
  redis.call('PEXPIRE', key, window_ms + 1000)
  local remaining = math.max(0, limit - counts[index] - 1)
  local ratio = remaining / limit
  local reset_ms = resets[index]
  if counts[index] == 0 then
    reset_ms = now_ms + window_ms
  end
  if selected_ratio == nil or ratio < selected_ratio then
    selected_ratio = ratio
    selected_limit = limit
    selected_remaining = remaining
    selected_reset = math.ceil(reset_ms / 1000)
    selected_retry = 0
  end
end

return {1, selected_limit, selected_remaining, selected_reset, selected_retry}
`;

const RELEASE_LEASE_SCRIPT = String.raw`
if redis.call('GET', KEYS[1]) == ARGV[1] then
  return redis.call('DEL', KEYS[1])
end
return 0
`;

function integer(value: unknown): number {
  const parsed = typeof value === 'number' ? value : Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < 0) {
    throw new RateLimitStoreUnavailableError();
  }
  return parsed;
}

export class RedisRateLimitStore implements RateLimitStore {
  constructor(private readonly client: RedisRateLimitClient) {}

  async consume(
    key: string,
    rules: readonly RateLimitRule[],
  ): Promise<RateLimitDecision> {
    if (rules.length === 0) throw new RateLimitStoreUnavailableError();
    const keys = rules.map((rule) => `${key}:${rule.windowSeconds}`);
    const args = rules.flatMap((rule) => [
      String(rule.limit),
      String(rule.windowSeconds * 1000),
    ]);
    try {
      const result = await this.client.eval(SLIDING_WINDOW_SCRIPT, {
        keys,
        arguments: [randomUUID(), String(rules.length), ...args],
      });
      if (!Array.isArray(result) || result.length !== 5) {
        throw new RateLimitStoreUnavailableError();
      }
      return {
        allowed: integer(result[0]) === 1,
        limit: integer(result[1]),
        remaining: integer(result[2]),
        resetEpochSeconds: integer(result[3]),
        retryAfterSeconds: integer(result[4]),
      };
    } catch (error) {
      if (error instanceof RateLimitStoreUnavailableError) throw error;
      throw new RateLimitStoreUnavailableError();
    }
  }

  async acquireLease(
    key: string,
    token: string,
    ttlMs: number,
  ): Promise<boolean> {
    if (!Number.isSafeInteger(ttlMs) || ttlMs <= 0) {
      throw new RateLimitStoreUnavailableError();
    }
    try {
      return (
        (await this.client.set(key, token, { NX: true, PX: ttlMs })) === 'OK'
      );
    } catch {
      throw new RateLimitStoreUnavailableError();
    }
  }

  async releaseLease(key: string, token: string): Promise<void> {
    try {
      await this.client.eval(RELEASE_LEASE_SCRIPT, {
        keys: [key],
        arguments: [token],
      });
    } catch {
      throw new RateLimitStoreUnavailableError();
    }
  }
}
