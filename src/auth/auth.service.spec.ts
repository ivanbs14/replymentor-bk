import { JwtService } from '@nestjs/jwt';
import {
  BadRequestException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { scryptSync } from 'node:crypto';
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

  function setup(passwordHash = 'unused') {
    const prisma = {
      user: {
        findUnique: jest.fn().mockResolvedValue({ ...user, passwordHash }),
        create: jest.fn(),
      },
    };
    const jwtService = new JwtService();
    const sign = jest.spyOn(jwtService, 'sign');
    const config = new AuthConfigService();
    return {
      prisma,
      jwtService,
      sign,
      config,
      service: new AuthService(
        prisma as unknown as PrismaService,
        jwtService,
        config,
      ),
    };
  }

  const password = ' secret123 ';
  const salt = 'deterministic-test-salt';
  const passwordHash = `${salt}:${scryptSync(password, salt, 64).toString('hex')}`;

  it('logs in with normalized email and an unchanged password, issuing only public user data', async () => {
    const { service, prisma, jwtService, config, sign } = setup(passwordHash);
    const result = await service.login({
      email: ' USER@example.com ',
      password,
    });
    const claims = jwtService.verify<{
      sub: string;
      email: string;
      iat: number;
      exp: number;
    }>(result.token, {
      ...config.verifyOptions(),
      secret: config.secret,
    });

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: user.email },
    });
    expect(result.user).toEqual({ id: user.id, email: user.email });
    expect(claims).toMatchObject({
      sub: user.id,
      email: user.email,
      iss: config.issuer,
      aud: config.audience,
    });
    expect(claims.exp - claims.iat).toBe(JWT_TTL_SECONDS);
    expect(sign).toHaveBeenCalledTimes(1);
    expect(prisma.user.create).not.toHaveBeenCalled();
    expect(result.user).not.toHaveProperty('passwordHash');
  });

  it.each(['wrong-password', 'secret123'])(
    'rejects an invalid password without issuing a token (%s)',
    async (invalidPassword) => {
      const { service, sign, prisma } = setup(passwordHash);
      await expect(
        service.login({ email: user.email, password: invalidPassword }),
      ).rejects.toThrow(UnauthorizedException);
      expect(sign).not.toHaveBeenCalled();
      expect(prisma.user.create).not.toHaveBeenCalled();
    },
  );

  it('uses the same unauthorized response when the email does not exist', async () => {
    const { service, prisma, sign } = setup();
    prisma.user.findUnique.mockResolvedValue(null);
    await expect(
      service.login({ email: user.email, password }),
    ).rejects.toMatchObject({
      response: { statusCode: 401, message: 'Credenciais inválidas.' },
    });
    expect(sign).not.toHaveBeenCalled();
  });

  it('rejects a duplicate normalized email before writing a user or issuing a token', async () => {
    const { service, prisma, sign } = setup();
    await expect(
      service.register({ email: ' USER@example.com ', password }),
    ).rejects.toThrow(ConflictException);
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: user.email },
    });
    expect(prisma.user.create).not.toHaveBeenCalled();
    expect(sign).not.toHaveBeenCalled();
  });

  it.each([
    { email: 'invalid', password: 'secret123' },
    { email: user.email, password: 'short' },
  ])('rejects invalid credentials before database lookup', async (payload) => {
    const { service, prisma, sign } = setup();
    await expect(service.login(payload)).rejects.toThrow(BadRequestException);
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
    expect(sign).not.toHaveBeenCalled();
  });
});
