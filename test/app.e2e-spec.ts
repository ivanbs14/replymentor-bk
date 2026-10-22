import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma.service';
import { configureApp } from './../src/app.setup';
import { AiService } from './../src/ai/ai.service';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;
  const user = {
    id: 'e2e-user-1',
    email: 'e2e@example.com',
    passwordHash: 'unused',
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  };
  const context = {
    id: `c${'a'.repeat(24)}`,
    userId: user.id,
    resumeText:
      'Contexto privado do candidato A com experiência em Node.js e PostgreSQL.',
    interviewType: 'Técnica (Coding/System Design)',
    jobLevel: 'Sênior',
    jobDescription: 'Desenvolvimento de APIs concorrentes.',
    companySegment: 'Tecnologia',
    responsePreference: 'direta e curta',
    aiBehavior: null,
    companyName: 'Empresa privada',
    sessions: [],
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
  const sessionId = `c${'b'.repeat(24)}`;
  const summary = {
    id: 'summary-a',
    sessionId,
    content: 'Resumo privado A.',
    topics: [],
  };
  let prisma: ReturnType<typeof createPrismaMock>;
  const ai = {
    transcribeLiveChunk: jest.fn(),
    generateSuggestedAnswer: jest.fn(),
    resolveGenerationTarget: jest.fn(),
  };

  function createPrismaMock() {
    const users: Array<typeof user> = [];
    const ownedSession = {
      id: sessionId,
      contextId: context.id,
      status: 'ACTIVE',
      nextTranscriptSequence: 1,
      context,
    };
    const tx = {
      $queryRaw: jest
        .fn()
        .mockImplementation((query: { values: unknown[] }) =>
          Promise.resolve(
            query.values[0] === sessionId && query.values[1] === user.id
              ? [ownedSession]
              : [],
          ),
        ),
      interviewSession: { update: jest.fn() },
      sessionSummary: { findUnique: jest.fn(), create: jest.fn() },
      suggestedResponse: { findMany: jest.fn() },
    };
    return {
      user: {
        findUnique: jest
          .fn()
          .mockImplementation(
            ({ where }: { where: { id?: string; email?: string } }) =>
              Promise.resolve(
                users.find((item) =>
                  where.id ? item.id === where.id : item.email === where.email,
                ) ?? null,
              ),
          ),
        create: jest
          .fn()
          .mockImplementation(
            ({ data }: { data: { email: string; passwordHash: string } }) => {
              const created = {
                ...user,
                ...data,
                id: users.length === 0 ? user.id : 'e2e-user-2',
              };
              users.push(created);
              return Promise.resolve(created);
            },
          ),
      },
      interviewContext: {
        findUnique: jest
          .fn()
          .mockImplementation(({ where }: { where: { id: string } }) =>
            Promise.resolve(where.id === context.id ? context : null),
          ),
        findFirst: jest
          .fn()
          .mockImplementation(({ where }: { where: { userId: string } }) =>
            Promise.resolve(where.userId === user.id ? context : null),
          ),
        findMany: jest
          .fn()
          .mockImplementation(({ where }: { where: { userId: string } }) =>
            Promise.resolve(where.userId === user.id ? [context] : []),
          ),
      },
      interviewSession: {
        findUnique: jest
          .fn()
          .mockImplementation(({ where }: { where: { id: string } }) =>
            Promise.resolve(where.id === sessionId ? ownedSession : null),
          ),
        create: jest.fn().mockResolvedValue(ownedSession),
      },
      sessionSummary: { findUnique: jest.fn().mockResolvedValue(summary) },
      $transaction: jest.fn((callback: (client: typeof tx) => unknown) =>
        callback(tx),
      ),
      $disconnect: jest.fn(),
      tx,
    };
  }

  async function registerAgent(email: string) {
    const agent = request.agent(app.getHttpServer());
    await agent
      .post('/auth/register')
      .set('Origin', 'http://localhost:3000')
      .send({ email, password: 'secret123' })
      .expect(201);
    return agent;
  }

  beforeEach(async () => {
    process.env.NODE_ENV = 'test';
    process.env.JWT_SECRET = 'e'.repeat(32);
    process.env.JWT_ISSUER = 'replymentor-api';
    process.env.JWT_AUDIENCE = 'replymentor-web';
    process.env.CORS_ORIGINS = 'http://localhost:3000';

    jest.clearAllMocks();
    prisma = createPrismaMock();
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prisma)
      .overrideProvider(AiService)
      .useValue(ai)
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
    await agent.get('/auth/me').expect(401);
  });

  it('authenticates login, rejects invalid credentials and duplicate registration without setting a session', async () => {
    await registerAgent(user.email);
    const loginAgent = request.agent(app.getHttpServer());
    const login = await loginAgent
      .post('/auth/login')
      .set('Origin', 'http://localhost:3000')
      .send({ email: ' E2E@EXAMPLE.COM ', password: 'secret123' })
      .expect(201);
    expect(login.body).toEqual({ user: { id: user.id, email: user.email } });
    expect(login.headers['set-cookie']?.[0]).toContain('HttpOnly');
    await loginAgent.get('/auth/me').expect(200);

    for (const email of [user.email, 'missing@example.com']) {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .set('Origin', 'http://localhost:3000')
        .send({ email, password: 'incorrect123' })
        .expect(401);
      expect(response.headers['set-cookie']).toBeUndefined();
      expect(response.body).toMatchObject({
        statusCode: 401,
        code: 'UNAUTHORIZED',
        message: 'Não autorizado.',
      });
      expect(JSON.stringify(response.body)).not.toContain('passwordHash');
    }
    const duplicate = await request(app.getHttpServer())
      .post('/auth/register')
      .set('Origin', 'http://localhost:3000')
      .send({ email: user.email, password: 'secret123' })
      .expect(409);
    expect(duplicate.headers['set-cookie']).toBeUndefined();
    expect(prisma.user.create).toHaveBeenCalledTimes(1);
  });

  it('isolates context, session operations and summary between two authenticated cookie agents', async () => {
    const agentA = await registerAgent(user.email);
    const agentB = await registerAgent('other@example.com');
    await agentA
      .get('/auth/me')
      .expect(200)
      .expect((response) => {
        expect((response.body as { id: string }).id).toBe(user.id);
      });
    await agentB
      .get('/auth/me')
      .expect(200)
      .expect((response) => {
        expect((response.body as { id: string }).id).toBe('e2e-user-2');
      });
    await agentA
      .get('/interview/context/latest')
      .expect(200)
      .expect((response) => {
        expect((response.body as { id: string }).id).toBe(context.id);
      });
    await agentB.get('/interview/context/latest').expect(404);
    await agentA
      .get('/interview/contexts')
      .expect(200)
      .expect((response) => {
        expect(response.body).toEqual([
          expect.objectContaining({ id: context.id }),
        ]);
      });
    await agentB.get('/interview/contexts').expect(200).expect([]);
    await agentA
      .post('/interview/sessions/start')
      .set('Origin', 'http://localhost:3000')
      .send({ contextId: context.id })
      .expect(201);
    prisma.interviewSession.create.mockClear();
    await agentB
      .post('/interview/sessions/start')
      .set('Origin', 'http://localhost:3000')
      .send({ contextId: context.id })
      .expect(404);
    expect(prisma.interviewSession.create).not.toHaveBeenCalled();
    await agentA
      .get(`/interview/sessions/${sessionId}/summary`)
      .expect(200)
      .expect(summary);
    prisma.sessionSummary.findUnique.mockClear();
    await agentB.get(`/interview/sessions/${sessionId}/summary`).expect(404);
    expect(prisma.sessionSummary.findUnique).not.toHaveBeenCalled();

    for (const [operation, payload] of [
      ['transcripts', { transcript: 'Pergunta?' }],
      ['generate-response', {}],
      ['end', {}],
    ] as const) {
      const response = await agentB
        .post(`/interview/sessions/${sessionId}/${operation}`)
        .set('Origin', 'http://localhost:3000')
        .set('Idempotency-Key', '550e8400-e29b-41d4-a716-446655440000')
        .send(payload)
        .expect(404);
      expect(response.body).toMatchObject({ statusCode: 404 });
      expect(JSON.stringify(response.body)).not.toContain(context.resumeText);
      expect(JSON.stringify(response.body)).not.toContain(summary.content);
    }
    expect(ai.transcribeLiveChunk).not.toHaveBeenCalled();
    expect(ai.resolveGenerationTarget).not.toHaveBeenCalled();
    expect(ai.generateSuggestedAnswer).not.toHaveBeenCalled();
    expect(prisma.tx.interviewSession.update).not.toHaveBeenCalled();
    expect(prisma.tx.sessionSummary.create).not.toHaveBeenCalled();
  });

  it.each([
    ['get', '/interview/context/latest'],
    ['get', '/interview/contexts'],
    ['get', `/interview/sessions/${sessionId}/summary`],
    ['post', '/interview/sessions/start'],
    ['post', `/interview/sessions/${sessionId}/transcripts`],
    ['post', `/interview/sessions/${sessionId}/generate-response`],
    ['post', `/interview/sessions/${sessionId}/end`],
  ] as const)('requires authentication for %s %s', async (method, path) => {
    await request(app.getHttpServer())
      [method](path)
      .set('Origin', 'http://localhost:3000')
      .send({})
      .expect(401);
    expect(prisma.interviewContext.findFirst).not.toHaveBeenCalled();
    expect(prisma.interviewSession.findUnique).not.toHaveBeenCalled();
    expect(prisma.$transaction).not.toHaveBeenCalled();
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
