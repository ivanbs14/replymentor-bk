import { JwtService } from '@nestjs/jwt';
import type { PrismaService } from '../prisma.service';
import { AuthConfigService, JWT_TTL_SECONDS } from './auth-config.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  const originalEnv = process.env;
  const user = {
    id: 'user-1',
    email: 'user@example.com',
    passwordHash: 'unused',
  };

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      NODE_ENV: 'test',
      JWT_SECRET: 'j'.repeat(32),
    };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('registers a user and issues a strict 30-minute JWT', async () => {
    const prisma = {
      user: {
        findUnique: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue(user),
      },
    };
    const jwtService = new JwtService();
    const config = new AuthConfigService();
    const service = new AuthService(
      prisma as unknown as PrismaService,
      jwtService,
      config,
    );

    const result = await service.register({
      email: ' USER@example.com ',
      password: 'secret123',
    });
    const payload = jwtService.verify<{
      sub: string;
      email: string;
      iat: number;
      exp: number;
      iss: string;
      aud: string;
    }>(result.token, {
      ...config.verifyOptions(),
      secret: config.secret,
    });

    expect(result.user).toEqual({ id: user.id, email: user.email });
    expect(payload).toMatchObject({
      sub: user.id,
      email: user.email,
      iss: config.issuer,
      aud: config.audience,
    });
    expect(payload.exp - payload.iat).toBe(JWT_TTL_SECONDS);
    expect(prisma.user.create).toHaveBeenCalledTimes(1);
  });
});
