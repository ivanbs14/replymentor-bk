import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma.service';
import { configureApp } from './../src/app.setup';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;
  const user = {
    id: 'e2e-user-1',
    email: 'e2e@example.com',
    passwordHash: 'unused',
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  };

  beforeEach(async () => {
    process.env.NODE_ENV = 'test';
    process.env.JWT_SECRET = 'e'.repeat(32);
    process.env.JWT_ISSUER = 'replymentor-api';
    process.env.JWT_AUDIENCE = 'replymentor-web';
    process.env.CORS_ORIGINS = 'http://localhost:3000';

    const prisma = {
      user: {
        findUnique: jest
          .fn()
          .mockResolvedValueOnce(null)
          .mockResolvedValue(user),
        create: jest.fn().mockResolvedValue(user),
      },
      $disconnect: jest.fn(),
    };
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prisma)
      .compile();

    app = moduleFixture.createNestApplication();
    configureApp(app);
    await app.init();
  });

  it('uses an HttpOnly cookie for the authentication contract', async () => {
    const agent = request.agent(app.getHttpServer());
    const register = await agent
      .post('/auth/register')
      .set('Origin', 'http://localhost:3000')
      .send({ email: user.email, password: 'secret123' })
      .expect(201);

    expect(register.body).toEqual({
      user: { id: user.id, email: user.email },
    });
    expect(register.body).not.toHaveProperty('accessToken');
    expect(register.headers['set-cookie']?.[0]).toContain(
      'replymentor_session=',
    );
    expect(register.headers['set-cookie']?.[0]).toContain('HttpOnly');
    expect(register.headers['set-cookie']?.[0]).toContain('Path=/');
    expect(register.headers['set-cookie']?.[0]).toContain('SameSite=Lax');
    expect(register.headers['set-cookie']?.[0]).toContain('Max-Age=1800');

    await agent
      .get('/auth/me')
      .expect(200)
      .expect((response) => {
        expect(response.body).toMatchObject({ id: user.id, email: user.email });
      });

    await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', 'Bearer legacy-token')
      .expect(401);

    const logout = await agent
      .post('/auth/logout')
      .set('Origin', 'http://localhost:3000')
      .send({})
      .expect(201);
    expect(logout.body).toEqual({ success: true });
    expect(logout.headers['set-cookie']?.[0]).toContain(
      'replymentor_session=;',
    );
  });

  it('rejects an untrusted mutation origin', () => {
    return request(app.getHttpServer())
      .post('/auth/logout')
      .set('Origin', 'https://evil.example')
      .send({})
      .expect(403);
  });

  it('rejects unknown fields with the sanitized validation contract', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .set('Origin', 'http://localhost:3000')
      .send({ email: user.email, password: 'secret123', isAdmin: true })
      .expect(400);
    const body = response.body as {
      statusCode: number;
      code: string;
      message: string;
      errors: Array<{ field: string; rule: string }>;
    };
    expect(body).toMatchObject({
      statusCode: 400,
      code: 'VALIDATION_ERROR',
      message: 'Payload inválido.',
    });
    expect(body.errors).toContainEqual({
      field: 'isAdmin',
      rule: 'whitelistValidation',
    });
    expect(JSON.stringify(response.body)).not.toContain('true');
  });

  it('enforces separate JSON and URL-encoded parser limits', async () => {
    const jsonResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .set('Origin', 'http://localhost:3000')
      .send({
        email: user.email,
        password: 'secret123',
        padding: 'x'.repeat(12 * 1024 * 1024),
      })
      .expect(413);
    expect(jsonResponse.body).toMatchObject({
      statusCode: 413,
      code: 'PAYLOAD_TOO_LARGE',
    });

    const formResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .set('Origin', 'http://localhost:3000')
      .type('form')
      .send({ email: user.email, password: 'x'.repeat(65 * 1024) })
      .expect(413);
    expect(formResponse.body).toMatchObject({
      statusCode: 413,
      code: 'PAYLOAD_TOO_LARGE',
    });
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect((response) => {
        const body = response.body as {
          service: string;
          status: string;
          timestamp: string;
        };

        expect(body).toMatchObject({
          service: 'replymentor-backend',
          status: 'ok',
        });
        expect(typeof body.timestamp).toBe('string');
        expect(Number.isNaN(Date.parse(body.timestamp))).toBe(false);
      });
  });

  afterEach(async () => {
    await app.close();
  });
});
