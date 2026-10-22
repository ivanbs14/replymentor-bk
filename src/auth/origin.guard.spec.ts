import { ForbiddenException } from '@nestjs/common';
import type { ExecutionContext } from '@nestjs/common';
import { AuthConfigService } from './auth-config.service';
import { OriginGuard } from './origin.guard';

describe('OriginGuard', () => {
  const originalEnv = process.env;
  let guard: OriginGuard;

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      NODE_ENV: 'test',
      JWT_SECRET: 'o'.repeat(32),
      CORS_ORIGINS: 'http://localhost:3000',
    };
    guard = new OriginGuard(new AuthConfigService());
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  function context(method: string, origin?: string) {
    return {
      switchToHttp: () => ({
        getRequest: () => ({
          method,
          headers: origin ? { origin } : {},
        }),
      }),
    } as unknown as ExecutionContext;
  }

  it('allows safe methods and trusted origins', () => {
    expect(guard.canActivate(context('GET', 'https://evil.example'))).toBe(
      true,
    );
    expect(guard.canActivate(context('POST', 'http://localhost:3000'))).toBe(
      true,
    );
  });

  it('rejects an untrusted browser origin on mutations', () => {
    expect(() =>
      guard.canActivate(context('POST', 'https://evil.example')),
    ).toThrow(ForbiddenException);
  });

  it('allows non-browser clients without an Origin header', () => {
    expect(guard.canActivate(context('POST'))).toBe(true);
  });
});
