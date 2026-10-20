import type { Response } from 'express';
import { AuthConfigService, AUTH_COOKIE_NAME } from './auth-config.service';
import { AuthController } from './auth.controller';
import type { AuthService } from './auth.service';

describe('AuthController', () => {
  const originalEnv = process.env;
  const user = { id: 'user-1', email: 'user@example.com' };
  let controller: AuthController;
  let authService: {
    register: jest.Mock;
    login: jest.Mock;
    me: jest.Mock;
  };
  let response: {
    cookie: jest.Mock;
    clearCookie: jest.Mock;
  };

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      NODE_ENV: 'test',
      JWT_SECRET: 'c'.repeat(32),
    };
    authService = {
      register: jest.fn().mockResolvedValue({ token: 'signed-token', user }),
      login: jest.fn().mockResolvedValue({ token: 'signed-token', user }),
      me: jest.fn(),
    };
    response = { cookie: jest.fn(), clearCookie: jest.fn() };
    controller = new AuthController(
      authService as unknown as AuthService,
      new AuthConfigService(),
    );
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it.each(['register', 'login'] as const)(
    '%s sets an HttpOnly cookie and omits the token from the body',
    async (method) => {
      const result = await controller[method](
        { email: user.email, password: 'secret123' },
        response as unknown as Response,
      );

      expect(response.cookie).toHaveBeenCalledWith(
        AUTH_COOKIE_NAME,
        'signed-token',
        expect.objectContaining({
          httpOnly: true,
          maxAge: 1_800_000,
          sameSite: 'lax',
          secure: false,
        }),
      );
      expect(result).toEqual({ user });
      expect(result).not.toHaveProperty('accessToken');
      expect(result).not.toHaveProperty('token');
    },
  );

  it('clears the cookie idempotently on logout', () => {
    expect(controller.logout(response as unknown as Response)).toEqual({
      success: true,
    });
    expect(response.clearCookie).toHaveBeenCalledWith(
      AUTH_COOKIE_NAME,
      expect.objectContaining({ httpOnly: true, path: '/', sameSite: 'lax' }),
    );
  });
});
