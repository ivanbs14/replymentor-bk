import { RateLimitConfig } from './rate-limit.config';

describe('RateLimitConfig', () => {
  const production = {
    NODE_ENV: 'production',
    REDIS_URL: 'redis://redis.railway.internal:6379',
    RATE_LIMIT_KEY_SECRET: 'r'.repeat(32),
    TRUST_PROXY_HOPS: '1',
  };

  it('requires Redis outside unit tests, including development', () => {
    for (const NODE_ENV of ['production', 'preview', 'development']) {
      expect(() => RateLimitConfig.fromEnv({ NODE_ENV })).toThrow(
        'REDIS_URL é obrigatório.',
      );
    }
  });

  it('allows explicit test store injection without silently requiring Redis', () => {
    expect(RateLimitConfig.fromEnv({ NODE_ENV: 'test' })).toMatchObject({
      redisUrl: null,
      redisRequired: false,
      trustProxyHops: 0,
    });
  });

  it('accepts production configuration and all approved default policies', () => {
    const config = RateLimitConfig.fromEnv(production);
    expect(config).toMatchObject({
      redisUrl: production.REDIS_URL,
      keySecret: production.RATE_LIMIT_KEY_SECRET,
      trustProxyHops: 1,
      redisRequired: true,
    });
    const actual = Object.fromEntries(
      Object.entries(config.policies).map(([group, rules]) => [
        group,
        rules.map(({ limit, windowSeconds }) => [limit, windowSeconds]),
      ]),
    );
    expect(actual).toEqual({
      auth_login_ip: [
        [10, 60],
        [30, 900],
      ],
      auth_login_account: [
        [5, 900],
        [20, 86400],
      ],
      auth_register_ip: [
        [3, 900],
        [10, 86400],
      ],
      auth_logout: [
        [10, 60],
        [60, 3600],
      ],
      read_default: [
        [60, 60],
        [600, 3600],
      ],
      context_write: [
        [10, 60],
        [60, 3600],
      ],
      session_start: [
        [5, 60],
        [30, 3600],
      ],
      transcript_text: [
        [20, 60],
        [300, 3600],
      ],
      transcript_audio: [
        [5, 60],
        [60, 3600],
      ],
      generate_response: [
        [5, 60],
        [60, 3600],
      ],
      session_end: [
        [5, 60],
        [30, 3600],
      ],
      summary_read: [
        [60, 60],
        [600, 3600],
      ],
      summary_retry: [
        [3, 3600],
        [3, 86400],
      ],
      health: [
        [120, 60],
        [2000, 3600],
      ],
    });
  });

  it('selects Render IP handling without trusting X-Forwarded-For hops', () => {
    const config = RateLimitConfig.fromEnv({
      ...production,
      DEPLOY_PROVIDER: 'render',
      TRUST_PROXY_HOPS: undefined,
    });
    expect(config.clientIpSource).toBe('render');
    expect(config.trustProxyHops).toBe(0);
  });

  it.each(['', 'railway', 'unknown', ' render '])(
    'rejects unsupported deploy provider %s',
    (DEPLOY_PROVIDER) => {
      expect(() =>
        RateLimitConfig.fromEnv({ ...production, DEPLOY_PROVIDER }),
      ).toThrow('DEPLOY_PROVIDER inválido.');
    },
  );

  it.each(['preview', 'staging', 'production'])(
    'requires secret and hops in %s',
    (NODE_ENV) => {
      expect(() =>
        RateLimitConfig.fromEnv({
          ...production,
          NODE_ENV,
          RATE_LIMIT_KEY_SECRET: undefined,
        }),
      ).toThrow('RATE_LIMIT_KEY_SECRET');
      expect(() =>
        RateLimitConfig.fromEnv({
          ...production,
          NODE_ENV,
          TRUST_PROXY_HOPS: undefined,
        }),
      ).toThrow('TRUST_PROXY_HOPS');
    },
  );

  it.each([
    'short',
    ' '.repeat(40),
    'replace-with-at-least-32-random-characters',
  ])('rejects invalid or public example secrets', (RATE_LIMIT_KEY_SECRET) => {
    expect(() =>
      RateLimitConfig.fromEnv({ ...production, RATE_LIMIT_KEY_SECRET }),
    ).toThrow('RATE_LIMIT_KEY_SECRET');
  });

  it('rejects reuse of the JWT secret', () => {
    expect(() =>
      RateLimitConfig.fromEnv({
        ...production,
        JWT_SECRET: production.RATE_LIMIT_KEY_SECRET,
      }),
    ).toThrow('RATE_LIMIT_KEY_SECRET');
  });

  it.each([
    '0',
    '-1',
    '1.5',
    'true',
    '1,2',
    '1e2',
    'Infinity',
    '9007199254740992',
    '',
  ])('rejects unsafe production hops %s', (TRUST_PROXY_HOPS) => {
    expect(() =>
      RateLimitConfig.fromEnv({ ...production, TRUST_PROXY_HOPS }),
    ).toThrow('TRUST_PROXY_HOPS');
  });

  it('trusts no proxy by default locally, and supports explicit local zero', () => {
    expect(
      RateLimitConfig.fromEnv({
        NODE_ENV: 'development',
        REDIS_URL: production.REDIS_URL,
      }).trustProxyHops,
    ).toBe(0);
    expect(
      RateLimitConfig.fromEnv({
        ...production,
        NODE_ENV: 'test',
        TRUST_PROXY_HOPS: '0',
      }).trustProxyHops,
    ).toBe(0);
  });

  it.each([
    'https://example.com',
    'redis://',
    'invalid',
    'redis://localhost/not-a-db',
    'redis://localhost:99999',
  ])('rejects malformed Redis URLs without reflecting them', (REDIS_URL) => {
    expect(() => RateLimitConfig.fromEnv({ ...production, REDIS_URL })).toThrow(
      'REDIS_URL inválida.',
    );
  });

  it('accepts TLS URLs with authentication and a database', () => {
    const REDIS_URL = 'rediss://default:password@redis.example.com:6379/2';
    expect(RateLimitConfig.fromEnv({ ...production, REDIS_URL }).redisUrl).toBe(
      REDIS_URL,
    );
  });

  it('merges valid overrides without mutating defaults or another instance', () => {
    const config = RateLimitConfig.fromEnv({
      ...production,
      RATE_LIMITS_JSON: '{"auth_login_ip":[{"limit":2,"windowSeconds":10}]}',
    });
    expect(config.policies.auth_login_ip).toEqual([
      { limit: 2, windowSeconds: 10 },
    ]);
    expect(config.policies.summary_read).toEqual([
      { limit: 60, windowSeconds: 60 },
      { limit: 600, windowSeconds: 3600 },
    ]);
    expect(
      RateLimitConfig.fromEnv(production).policies.auth_login_ip[0].limit,
    ).toBe(10);
    expect(Object.isFrozen(config.policies)).toBe(true);
    expect(Object.isFrozen(config.policies.auth_login_ip)).toBe(true);
    expect(Object.isFrozen(config.policies.auth_login_ip[0])).toBe(true);
  });

  it.each([
    'invalid',
    'null',
    '[]',
    'true',
    '{"unknown":[{"limit":1,"windowSeconds":60}]}',
    '{"__proto__":[{"limit":1,"windowSeconds":60}]}',
    '{"constructor":[{"limit":1,"windowSeconds":60}]}',
    '{"auth_login_ip":[]}',
    '{"auth_login_ip":null}',
    '{"auth_login_ip":[null]}',
    '{"auth_login_ip":[{"limit":1}]}',
    '{"auth_login_ip":[{"limit":1,"windowSeconds":60,"extra":true}]}',
    '{"auth_login_ip":[{"limit":"1","windowSeconds":60}]}',
    '{"auth_login_ip":[{"limit":0,"windowSeconds":60}]}',
    '{"auth_login_ip":[{"limit":-1,"windowSeconds":60}]}',
    '{"auth_login_ip":[{"limit":1.5,"windowSeconds":60}]}',
    '{"auth_login_ip":[{"limit":1e100,"windowSeconds":60}]}',
    '{"auth_login_ip":[{"limit":1,"windowSeconds":0}]}',
    '{"auth_login_ip":[{"limit":1,"windowSeconds":0.5}]}',
    '{"auth_login_ip":[{"limit":1,"windowSeconds":9007199254740991}]}',
    '{"auth_login_ip":[{"limit":1,"windowSeconds":60},{"limit":2,"windowSeconds":60}]}',
  ])(
    'rejects invalid policy JSON without exposing input: %s',
    (RATE_LIMITS_JSON) => {
      expect(() =>
        RateLimitConfig.fromEnv({ ...production, RATE_LIMITS_JSON }),
      ).toThrow('RATE_LIMITS_JSON inválido.');
    },
  );
});
