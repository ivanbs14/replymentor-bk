import { randomUUID } from 'node:crypto';
import { type INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/app.setup';
import { AiService } from '../src/ai/ai.service';
import { PrismaService } from '../src/prisma.service';

const origin = 'http://localhost:3000';
const generatedAnswer = {
  detectedQuestion: 'Como você protege dados entre usuários?',
  suggestedAnswer: 'Valido a propriedade de cada recurso.',
  shortVersion: 'Valido ownership.',
  keyPoints: ['ownership', '404'],
  strategicNote: 'Demonstre com um teste negativo.',
};

describe('Final API + Prisma contracts', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    process.env.JWT_SECRET = 'integration-only-secret-with-32-characters';
    process.env.JWT_ISSUER = 'replymentor-api';
    process.env.JWT_AUDIENCE = 'replymentor-web';
    process.env.CORS_ORIGINS = origin;
    process.env.COOKIE_SECURE = 'false';
    process.env.COOKIE_SAME_SITE = 'lax';

    const ai = {
      transcribeLiveChunk: jest
        .fn()
        .mockImplementation(({ transcript }: { transcript?: string }) =>
          Promise.resolve(transcript?.trim() ?? 'transcrição simulada'),
        ),
      generateSuggestedAnswer: jest.fn().mockResolvedValue(generatedAnswer),
      resolveGenerationTarget: jest.fn().mockReturnValue({
        provider: 'gemini',
        model: 'gemini-2.0-flash',
      }),
    };
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(AiService)
      .useValue(ai)
      .compile();

    app = moduleFixture.createNestApplication();
    configureApp(app);
    await app.init();
    prisma = app.get(PrismaService);
    await prisma.$connect();
  });

  beforeEach(async () => {
    await prisma.$executeRawUnsafe(`
      TRUNCATE TABLE "SessionSummary", "SuggestedResponse", "TranscriptChunk",
      "InterviewSession", "InterviewContext", "User" RESTART IDENTITY CASCADE
    `);
  });

  afterAll(async () => {
    await app.close();
  });

  async function register(email: string) {
    const agent = request.agent(app.getHttpServer());
    await agent
      .post('/auth/register')
      .set('Origin', origin)
      .send({ email, password: 'test-password-123' })
      .expect(201);
    return agent;
  }

  it('returns 404 when user B accesses context, session or summary owned by user A', async () => {
    const owner = await register('owner@example.test');
    const intruder = await register('intruder@example.test');
    const contextResponse = await owner
      .post('/interview/context')
      .set('Origin', origin)
      .send({
        resumeText:
          'Experiência fictícia em TypeScript, APIs seguras e testes automatizados.',
        interviewType: 'Técnica (Coding/System Design)',
        jobLevel: 'Pleno',
        jobDescription:
          'Construir serviços seguros e cobertos por testes automatizados.',
        companyName: 'Empresa Exemplo',
        responsePreference: 'equilibrada',
      })
      .expect(201);
    const context = contextResponse.body as { id: string };

    await intruder
      .post('/interview/sessions/start')
      .set('Origin', origin)
      .send({ contextId: context.id })
      .expect(404);

    const startedResponse = await owner
      .post('/interview/sessions/start')
      .set('Origin', origin)
      .send({ contextId: context.id })
      .expect(201);
    const started = startedResponse.body as { id: string };
    const sessionPath = `/interview/sessions/${started.id}`;

    await intruder
      .post(`${sessionPath}/transcripts`)
      .set('Origin', origin)
      .set('Idempotency-Key', randomUUID())
      .send({ transcript: 'Dado que não pertence ao usuário B.' })
      .expect(404);
    await intruder
      .post(`${sessionPath}/generate-response`)
      .set('Origin', origin)
      .set('Idempotency-Key', randomUUID())
      .send({})
      .expect(404);
    await intruder
      .post(`${sessionPath}/end`)
      .set('Origin', origin)
      .send({})
      .expect(404);
    await intruder
      .get(`${sessionPath}/summary`)
      .set('Origin', origin)
      .expect(404);

    await owner
      .post(`${sessionPath}/transcripts`)
      .set('Origin', origin)
      .set('Idempotency-Key', randomUUID())
      .send({ transcript: generatedAnswer.detectedQuestion })
      .expect(201);
    await owner
      .post(`${sessionPath}/generate-response`)
      .set('Origin', origin)
      .set('Idempotency-Key', randomUUID())
      .send({ provider: 'gemini' })
      .expect(201)
      .expect(({ body }) =>
        expect(body).toMatchObject({
          ...generatedAnswer,
          status: 'ANSWER_READY',
          detection: {
            status: 'DETECTED',
            question: generatedAnswer.detectedQuestion,
            confidence: null,
            source: 'LEGACY',
            detectorVersion: 'legacy-v1',
          },
          answer: generatedAnswer,
        }),
      );
    const endedResponse = await owner
      .post(`${sessionPath}/end`)
      .set('Origin', origin)
      .send({})
      .expect(201);
    const ended = endedResponse.body as { id: string };
    await owner
      .get(`${sessionPath}/summary`)
      .set('Origin', origin)
      .expect(200)
      .expect(({ body }: { body: { id: string } }) =>
        expect(body.id).toBe(ended.id),
      );
  });
});
