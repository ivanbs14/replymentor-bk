import { UnauthorizedException } from '@nestjs/common';
import type { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { AuthConfigService, AUTH_COOKIE_NAME } from './auth-config.service';
import { AuthGuard } from './auth.guard';

describe('AuthGuard', () => {
  const originalEnv = process.env;
  let config: AuthConfigService;
  let jwtService: JwtService;
  let reflector: { getAllAndOverride: jest.Mock };

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      NODE_ENV: 'test',
      JWT_SECRET: 's'.repeat(32),
    };
    config = new AuthConfigService();
    jwtService = new JwtService();
    reflector = { getAllAndOverride: jest.fn().mockReturnValue(false) };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  function context(cookies: Record<string, string> = {}) {
    const request: {
      cookies: Record<string, string>;
      user?: { userId: string; email: string };
    } = { cookies };
    return {
      request,
      executionContext: {
        getHandler: () => undefined,
        getClass: () => undefined,
        switchToHttp: () => ({ getRequest: () => request }),
      } as unknown as ExecutionContext,
    };
  }

  function token(overrides: Record<string, unknown> = {}) {
    return jwtService.sign(
      { email: 'user@example.com', ...overrides },
      {
        ...config.signOptions(),
        secret: config.secret,
        subject: 'user-1',
      },
    );
  }

  it('authenticates a valid cookie', () => {
    const guard = new AuthGuard(
      reflector as unknown as Reflector,
      jwtService,
      config,
    );
    const { request, executionContext } = context({
      [AUTH_COOKIE_NAME]: token(),
    });

    expect(guard.canActivate(executionContext)).toBe(true);
    expect(request.user).toEqual({
      userId: 'user-1',
      email: 'user@example.com',
    });
  });

  it('rejects missing and invalid cookies', () => {
    const guard = new AuthGuard(
      reflector as unknown as Reflector,
      jwtService,
      config,
    );
    expect(() => guard.canActivate(context().executionContext)).toThrow(
      UnauthorizedException,
    );
    expect(() =>
      guard.canActivate(
        context({ [AUTH_COOKIE_NAME]: `${token()}altered` }).executionContext,
      ),
    ).toThrow(UnauthorizedException);
  });

  it('rejects a token with the wrong audience', () => {
    const guard = new AuthGuard(
      reflector as unknown as Reflector,
      jwtService,
      config,
    );
    const wrongAudience = jwtService.sign(
      { email: 'user@example.com' },
      {
        algorithm: 'HS256',
        audience: 'another-app',
        expiresIn: 1800,
        issuer: config.issuer,
        secret: config.secret,
        subject: 'user-1',
      },
    );

    expect(() =>
      guard.canActivate(
        context({ [AUTH_COOKIE_NAME]: wrongAudience }).executionContext,
      ),
    ).toThrow(UnauthorizedException);
  });

  it('rejects a token with the wrong issuer', () => {
    const guard = new AuthGuard(
      reflector as unknown as Reflector,
      jwtService,
      config,
    );
    const invalidToken = jwtService.sign(
      { email: 'user@example.com' },
      {
        algorithm: 'HS256',
        audience: config.audience,
        expiresIn: 1800,
        issuer: 'another-api',
        secret: config.secret,
        subject: 'user-1',
      },
    );

    expect(() =>
      guard.canActivate(
        context({ [AUTH_COOKIE_NAME]: invalidToken }).executionContext,
      ),
    ).toThrow(UnauthorizedException);
  });

  it('rejects a token with the wrong algorithm', () => {
    const guard = new AuthGuard(
      reflector as unknown as Reflector,
      jwtService,
      config,
    );
    const invalidToken = jwtService.sign(
      { email: 'user@example.com' },
      {
        algorithm: 'HS384',
        audience: config.audience,
        expiresIn: 1800,
        issuer: config.issuer,
        secret: config.secret,
        subject: 'user-1',
      },
    );

    expect(() =>
      guard.canActivate(
        context({ [AUTH_COOKIE_NAME]: invalidToken }).executionContext,
      ),
    ).toThrow(UnauthorizedException);
  });

  it('rejects an expired token', () => {
    const guard = new AuthGuard(
      reflector as unknown as Reflector,
      jwtService,
      config,
    );
    const expired = jwtService.sign(
      { email: 'user@example.com' },
      {
        algorithm: 'HS256',
        audience: config.audience,
        expiresIn: -1,
        issuer: config.issuer,
        secret: config.secret,
        subject: 'user-1',
      },
    );

    expect(() =>
      guard.canActivate(
        context({ [AUTH_COOKIE_NAME]: expired }).executionContext,
      ),
    ).toThrow(UnauthorizedException);
  });

  it.each([
    ['iat', { email: 'user@example.com', exp: 4_000_000_000 }],
    ['exp', { email: 'user@example.com', iat: 1 }],
  ])('rejects a token without %s', (_claim, payload) => {
    const guard = new AuthGuard(
      reflector as unknown as Reflector,
      jwtService,
      config,
    );
    const incomplete = jwtService.sign(payload, {
      algorithm: 'HS256',
      audience: config.audience,
      issuer: config.issuer,
      noTimestamp: true,
      secret: config.secret,
      subject: 'user-1',
    });

    expect(() =>
      guard.canActivate(
        context({ [AUTH_COOKIE_NAME]: incomplete }).executionContext,
      ),
    ).toThrow(UnauthorizedException);
  });
});
