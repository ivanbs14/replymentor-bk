import { randomBytes } from 'node:crypto';
import { DEFAULT_RATE_LIMIT_POLICIES } from './rate-limit.policies';
import type { RateLimitGroup, RateLimitRule } from './rate-limit.types';

export type RateLimitEnvironment = Record<string, string | undefined>;
type Policies = Readonly<Record<RateLimitGroup, readonly RateLimitRule[]>>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parsePolicies(raw: string | undefined): Policies {
  if (raw === undefined) return DEFAULT_RATE_LIMIT_POLICIES;

  const invalid = () => new Error('RATE_LIMITS_JSON inválido.');
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw invalid();
  }
  if (!isRecord(parsed)) throw invalid();

  const policies: Record<RateLimitGroup, readonly RateLimitRule[]> = {
    ...DEFAULT_RATE_LIMIT_POLICIES,
  };
  for (const [group, value] of Object.entries(parsed)) {
    if (
      !Object.hasOwn(DEFAULT_RATE_LIMIT_POLICIES, group) ||
      !Array.isArray(value) ||
      value.length === 0
    ) {
      throw invalid();
    }

    const windows = new Set<number>();
    const rules = value.map((rule: unknown): RateLimitRule => {
      if (
        !isRecord(rule) ||
        Object.keys(rule).length !== 2 ||
        typeof rule.limit !== 'number' ||
        !Number.isSafeInteger(rule.limit) ||
        rule.limit <= 0 ||
        typeof rule.windowSeconds !== 'number' ||
        !Number.isSafeInteger(rule.windowSeconds) ||
        rule.windowSeconds <= 0 ||
        !Number.isSafeInteger(rule.windowSeconds * 1000) ||
        windows.has(rule.windowSeconds)
      ) {
        throw invalid();
      }
      windows.add(rule.windowSeconds);
      return Object.freeze({
        limit: rule.limit,
        windowSeconds: rule.windowSeconds,
      });
    });
    policies[group as RateLimitGroup] = Object.freeze(rules);
  }
  return Object.freeze(policies);
}

export class RateLimitConfig {
  private constructor(
    readonly redisUrl: string | null,
    readonly keySecret: string,
    readonly trustProxyHops: number,
    readonly redisRequired: boolean,
    readonly policies: Policies,
  ) {}

  static fromEnv(env: RateLimitEnvironment = process.env): RateLimitConfig {
    const environment = env.NODE_ENV ?? 'development';
    const isLocal = environment === 'development' || environment === 'test';
    const redisRequired = environment !== 'test';
    const redisUrl = env.REDIS_URL?.trim() || null;
    if (redisRequired && !redisUrl) throw new Error('REDIS_URL é obrigatório.');
    if (redisUrl) {
      try {
        const parsed = new URL(redisUrl);
        if (
          !['redis:', 'rediss:'].includes(parsed.protocol) ||
          !parsed.hostname ||
          !/^\/?\d*$/.test(parsed.pathname) ||
          parsed.search ||
          parsed.hash
        ) {
          throw new Error();
        }
      } catch {
        // Do not surface parser errors: they can contain credentials.
        throw new Error('REDIS_URL inválida.');
      }
    }

    let keySecret = env.RATE_LIMIT_KEY_SECRET?.trim();
    if (!keySecret && isLocal && env.RATE_LIMIT_KEY_SECRET === undefined) {
      // Local-only ephemeral secret; distributed local processes must set one.
      keySecret = randomBytes(32).toString('hex');
    }
    if (!keySecret || keySecret.length < 32) {
      throw new Error(
        'RATE_LIMIT_KEY_SECRET deve ter pelo menos 32 caracteres.',
      );
    }
    if (keySecret === 'replace-with-at-least-32-random-characters') {
      throw new Error('RATE_LIMIT_KEY_SECRET usa um valor público de exemplo.');
    }
    if (keySecret === env.JWT_SECRET?.trim()) {
      throw new Error(
        'RATE_LIMIT_KEY_SECRET deve ser diferente de JWT_SECRET.',
      );
    }

    const rawHops = env.TRUST_PROXY_HOPS?.trim();
    const trustProxyHops =
      rawHops === undefined && isLocal ? 0 : Number(rawHops);
    if (
      (rawHops !== undefined && !/^\d+$/.test(rawHops)) ||
      !Number.isSafeInteger(trustProxyHops) ||
      trustProxyHops < (isLocal ? 0 : 1)
    ) {
      throw new Error(
        'TRUST_PROXY_HOPS deve ser um inteiro válido para o ambiente.',
      );
    }

    return new RateLimitConfig(
      redisUrl,
      keySecret,
      trustProxyHops,
      redisRequired,
      parsePolicies(env.RATE_LIMITS_JSON),
    );
  }
}
