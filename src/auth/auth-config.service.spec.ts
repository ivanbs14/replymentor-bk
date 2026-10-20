import {
  AUTH_COOKIE_NAME,
  AuthConfigService,
  JWT_TTL_SECONDS,
} from './auth-config.service';

describe('AuthConfigService', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      NODE_ENV: 'test',
      JWT_SECRET: 'a'.repeat(32),
    };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('uses safe local cookie and claim defaults', () => {
    const config = new AuthConfigService();

    expect(AUTH_COOKIE_NAME).toBe('replymentor_session');
    expect(config.issuer).toBe('replymentor-api');
    expect(config.audience).toBe('replymentor-web');
    expect(config.allowedOrigins).toEqual(['http://localhost:3000']);
    expect(config.cookieOptions()).toEqual({
      httpOnly: true,
      maxAge: JWT_TTL_SECONDS * 1000,
      path: '/',
      sameSite: 'lax',
      secure: false,
    });
  });

  it('rejects a weak JWT secret', () => {
    process.env.JWT_SECRET = 'too-short';
    expect(() => new AuthConfigService()).toThrow(
      'JWT_SECRET deve ter pelo menos 32 caracteres.',
    );
  });

  it('requires explicit secure production settings', () => {
    process.env.NODE_ENV = 'production';
    delete process.env.JWT_ISSUER;
    delete process.env.JWT_AUDIENCE;
    delete process.env.CORS_ORIGINS;
    delete process.env.COOKIE_SECURE;
    delete process.env.COOKIE_SAME_SITE;

    expect(() => new AuthConfigService()).toThrow('JWT_ISSUER é obrigatório.');
  });

  it('accepts an explicit production configuration', () => {
    process.env = {
      ...process.env,
      NODE_ENV: 'production',
      JWT_ISSUER: 'replymentor-api',
      JWT_AUDIENCE: 'replymentor-web',
      CORS_ORIGINS: 'https://app.example.com',
      COOKIE_SECURE: 'true',
      COOKIE_SAME_SITE: 'none',
    };

    const config = new AuthConfigService();
    expect(config.allowedOrigins).toEqual(['https://app.example.com']);
    expect(config.cookieOptions()).toMatchObject({
      httpOnly: true,
      sameSite: 'none',
      secure: true,
    });
  });
});
