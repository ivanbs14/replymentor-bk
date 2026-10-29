import type { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { OperationalLogger } from '../observability/operational-logger';
import { ClientIpResolver } from './client-ip.resolver';
import { RateLimitConfig } from './rate-limit.config';
import type { RateLimitBinding } from './rate-limit.decorator';
import {
  RateLimitExceededException,
  RateLimitStoreUnavailableException,
} from './rate-limit.exception';
import { RateLimitGuard } from './rate-limit.guard';
import { RateLimitKeyService } from './rate-limit-key.service';
import {
  RateLimitStoreUnavailableError,
  type RateLimitDecision,
  type RateLimitStore,
} from './rate-limit.types';

describe('RateLimitGuard', () => {
  const allowed: RateLimitDecision = {
    allowed: true,
    limit: 10,
    remaining: 9,
    resetEpochSeconds: 100,
    retryAfterSeconds: 0,
  };
  const bindings: RateLimitBinding[] = [
    { group: 'auth_login_ip', identity: 'ip', failMode: 'closed' },
  ];

  function setup(options?: {
    selected?: readonly RateLimitBinding[];
    consume?: jest.MockedFunction<RateLimitStore['consume']>;
    body?: Record<string, unknown>;
    user?: { userId: string; email: string };
    headers?: Record<string, string | string[] | undefined>;
    ip?: string;
    configEnv?: Record<string, string | undefined>;
  }) {
    const consume =
      options?.consume ??
      jest
        .fn<
          ReturnType<RateLimitStore['consume']>,
          Parameters<RateLimitStore['consume']>
        >()
        .mockResolvedValue(allowed);
    const store: RateLimitStore = {
      consume,
      acquireLease: jest.fn(),
      releaseLease: jest.fn(),
    };
    const reflector = {
      getAllAndOverride: jest
        .fn()
        .mockReturnValue(options?.selected ?? bindings),
    } as unknown as Reflector;
    const response = { setHeader: jest.fn() };
    const request = {
      body: options?.body ?? {},
      headers: options?.headers ?? {},
      ip: options?.ip ?? '203.0.113.9',
      method: 'POST',
      params: { sessionId: 'session-a' },
      socket: {},
      user: options?.user,
    };
    const context = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => request,
        getResponse: () => response,
      }),
    } as unknown as ExecutionContext;
    const config = RateLimitConfig.fromEnv({
      NODE_ENV: 'test',
      RATE_LIMIT_KEY_SECRET: 's'.repeat(32),
      TRUST_PROXY_HOPS: '0',
      ...options?.configEnv,
    });
    const loggerWarn = jest.fn();
    const loggerError = jest.fn();
    const logger = {
      warn: loggerWarn,
      error: loggerError,
    } as unknown as OperationalLogger;
    const keys = new RateLimitKeyService('s'.repeat(32), 'test');
    const guard = new RateLimitGuard(
      reflector,
      config,
      store,
      keys,
      new ClientIpResolver(config.clientIpSource),
      logger,
    );
    return {
      consume,
      context,
      guard,
      keys,
      loggerError,
      loggerWarn,
      response,
    };
  }

  it('allows unconfigured routes without touching the store', async () => {
    const fixture = setup({ selected: [] });
    await expect(fixture.guard.canActivate(fixture.context)).resolves.toBe(
      true,
    );
    expect(fixture.consume).not.toHaveBeenCalled();
  });

  it('uses pseudonymized identities and publishes success headers', async () => {
    const fixture = setup();
    await expect(fixture.guard.canActivate(fixture.context)).resolves.toBe(
      true,
    );
    const key = fixture.consume.mock.calls[0][0];
    expect(key).toContain('auth_login_ip:replymentor:test:rate-limit:v1:ip:');
    expect(key).not.toContain('203.0.113.9');
    expect(fixture.response.setHeader).toHaveBeenCalledWith(
      'RateLimit-Remaining',
      9,
    );
  });

  it('ignores spoofed X-Forwarded-For and uses the Render header', async () => {
    const fixture = setup({
      headers: {
        'cf-connecting-ip': '203.0.113.10',
        'x-forwarded-for': '198.51.100.44',
      },
      configEnv: { DEPLOY_PROVIDER: 'render', TRUST_PROXY_HOPS: undefined },
    });
    await fixture.guard.canActivate(fixture.context);
    const key = fixture.consume.mock.calls[0][0];
    expect(key).toBe(`auth_login_ip:${fixture.keys.forIp('203.0.113.10')}`);
    expect(key).not.toBe(
      `auth_login_ip:${fixture.keys.forIp('198.51.100.44')}`,
    );
  });

  it('fails closed before Redis when the Render client IP is missing', async () => {
    const fixture = setup({
      headers: {},
      configEnv: { DEPLOY_PROVIDER: 'render', TRUST_PROXY_HOPS: undefined },
    });
    await expect(
      fixture.guard.canActivate(fixture.context),
    ).rejects.toBeInstanceOf(RateLimitStoreUnavailableException);
    expect(fixture.consume).not.toHaveBeenCalled();
    expect(fixture.loggerError).toHaveBeenCalledWith(
      expect.objectContaining({ event: 'rate_limit_identity_unavailable' }),
    );
  });

  it('fails open without Redis access for an open IP policy with no Render IP', async () => {
    const fixture = setup({
      selected: [{ group: 'health', identity: 'ip', failMode: 'open' }],
      headers: {},
      configEnv: { DEPLOY_PROVIDER: 'render', TRUST_PROXY_HOPS: undefined },
    });
    await expect(fixture.guard.canActivate(fixture.context)).resolves.toBe(
      true,
    );
    expect(fixture.consume).not.toHaveBeenCalled();
  });

  it('rejects exhausted policies with standard headers and sanitized logging', async () => {
    const fixture = setup({
      consume: jest.fn().mockResolvedValue({
        ...allowed,
        allowed: false,
        remaining: 0,
        retryAfterSeconds: 42,
      }),
    });
    await expect(
      fixture.guard.canActivate(fixture.context),
    ).rejects.toBeInstanceOf(RateLimitExceededException);
    expect(fixture.response.setHeader).toHaveBeenCalledWith('Retry-After', 42);
    expect(fixture.loggerWarn).toHaveBeenCalledWith(
      expect.objectContaining({
        event: 'rate_limit_blocked',
        policyGroup: 'auth_login_ip',
        retryBucket: '6-60s',
      }),
    );
  });

  it('fails open for reads and closed for protected mutations', async () => {
    const unavailable = jest
      .fn()
      .mockRejectedValue(new RateLimitStoreUnavailableError());
    const open = setup({
      consume: unavailable,
      selected: [{ group: 'read_default', identity: 'user', failMode: 'open' }],
      user: { userId: 'user-a', email: 'user@example.com' },
    });
    await expect(open.guard.canActivate(open.context)).resolves.toBe(true);
    expect(open.loggerError).toHaveBeenCalledWith(
      expect.objectContaining({ event: 'rate_limit_store_unavailable' }),
    );

    const closed = setup({ consume: unavailable });
    await expect(
      closed.guard.canActivate(closed.context),
    ).rejects.toBeInstanceOf(RateLimitStoreUnavailableException);
  });

  it('selects exactly one transcript policy from the payload', async () => {
    const selected: RateLimitBinding[] = [
      {
        group: 'transcript_text',
        identity: 'user-session',
        failMode: 'closed',
        when: 'text',
      },
      {
        group: 'transcript_audio',
        identity: 'user-session',
        failMode: 'closed',
        when: 'audio',
      },
    ];
    const audio = setup({
      selected,
      body: { audioBase64: 'YQ==' },
      user: { userId: 'user-a', email: 'user@example.com' },
    });
    await audio.guard.canActivate(audio.context);
    expect(audio.consume).toHaveBeenCalledTimes(1);
    expect(audio.consume.mock.calls[0][0]).toContain('transcript_audio:');
  });
});
