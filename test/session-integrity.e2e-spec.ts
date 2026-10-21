import { randomUUID } from 'node:crypto';
import { PrismaClient, SessionStatus } from '@prisma/client';
import type { AiService } from '../src/ai/ai.service';
import { InterviewService } from '../src/interview/interview.service';
import type { PrismaService } from '../src/prisma.service';

const prisma = new PrismaClient();

const generatedAnswer = {
  detectedQuestion: 'Tell me about yourself?',
  suggestedAnswer: 'A complete answer.',
  shortVersion: 'A short answer.',
  keyPoints: ['experience'],
  strategicNote: 'Stay concise.',
};

describe('Session integrity with PostgreSQL', () => {
  let userId: string;
  let contextId: string;
  let sessionId: string;
  let transcribeLiveChunk: jest.Mock;
  let generateSuggestedAnswer: jest.Mock;
  let service: InterviewService;

  beforeAll(async () => {
    await prisma.$connect();
  });

  beforeEach(async () => {
    await prisma.$executeRawUnsafe(`
      TRUNCATE TABLE "SessionSummary", "SuggestedResponse", "TranscriptChunk",
      "InterviewSession", "InterviewContext", "User" RESTART IDENTITY CASCADE
    `);
    const user = await prisma.user.create({
      data: { email: 'session-integrity@example.com', passwordHash: 'unused' },
    });
    const context = await prisma.interviewContext.create({
      data: {
        userId: user.id,
        resumeText: 'R'.repeat(50),
        interviewType: 'Técnica (Coding/System Design)',
        jobLevel: 'Pleno',
        jobDescription: 'D'.repeat(20),
        companyName: 'ReplyMentor',
        responsePreference: 'equilibrada',
      },
    });
    const session = await prisma.interviewSession.create({
      data: { contextId: context.id },
    });
    userId = user.id;
    contextId = context.id;
    sessionId = session.id;
    transcribeLiveChunk = jest
      .fn()
      .mockImplementation(({ transcript }: { transcript?: string }) =>
        Promise.resolve(transcript?.trim() ?? 'audio transcript'),
      );
    generateSuggestedAnswer = jest.fn().mockResolvedValue(generatedAnswer);
    const ai = {
      transcribeLiveChunk,
      generateSuggestedAnswer,
      resolveGenerationTarget: jest.fn().mockReturnValue({
        provider: 'gemini',
        model: 'gemini-2.0-flash',
      }),
    };
    service = new InterviewService(
      prisma as unknown as PrismaService,
      ai as unknown as AiService,
    );
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('allocates unique increasing sequences to concurrent transcripts', async () => {
    const results = await Promise.all([
      service.addTranscript(
        userId,
        sessionId,
        { transcript: 'A' },
        randomUUID(),
      ),
      service.addTranscript(
        userId,
        sessionId,
        { transcript: 'B' },
        randomUUID(),
      ),
    ]);

    expect(results).toHaveLength(2);
    const chunks = await prisma.transcriptChunk.findMany({
      orderBy: { sequence: 'asc' },
    });
    expect(chunks.map(({ sequence }) => sequence)).toEqual([1, 2]);
    expect(
      (
        await prisma.interviewSession.findUniqueOrThrow({
          where: { id: sessionId },
        })
      ).nextTranscriptSequence,
    ).toBe(3);
  });

  it('persists one transcript for simultaneous retries with the same key', async () => {
    const key = randomUUID();
    const [first, second] = await Promise.all([
      service.addTranscript(userId, sessionId, { transcript: 'same' }, key),
      service.addTranscript(userId, sessionId, { transcript: 'same' }, key),
    ]);

    expect(first.id).toBe(second.id);
    expect(await prisma.transcriptChunk.count()).toBe(1);
  });

  it('rejects reuse of a key with a different transcript', async () => {
    const key = randomUUID();
    await service.addTranscript(userId, sessionId, { transcript: 'A' }, key);

    await expect(
      service.addTranscript(userId, sessionId, { transcript: 'B' }, key),
    ).rejects.toMatchObject({
      response: { code: 'IDEMPOTENCY_KEY_REUSED' },
    });
    expect(await prisma.transcriptChunk.count()).toBe(1);
  });

  it('allows only one concurrent active session per context', async () => {
    await prisma.interviewSession.delete({ where: { id: sessionId } });
    const results = await Promise.allSettled([
      service.startSession(userId, { contextId }),
      service.startSession(userId, { contextId }),
    ]);

    expect(results.filter(({ status }) => status === 'fulfilled')).toHaveLength(
      1,
    );
    expect(results.filter(({ status }) => status === 'rejected')).toHaveLength(
      1,
    );
    expect(
      await prisma.interviewSession.count({
        where: { contextId, status: SessionStatus.ACTIVE },
      }),
    ).toBe(1);
  });

  it('closes once and returns the stable summary to concurrent callers', async () => {
    const [first, second] = await Promise.all([
      service.endSession(userId, sessionId),
      service.endSession(userId, sessionId),
    ]);
    const closed = await prisma.interviewSession.findUniqueOrThrow({
      where: { id: sessionId },
    });

    expect(first.id).toBe(second.id);
    expect(await prisma.sessionSummary.count()).toBe(1);
    expect(closed.status).toBe(SessionStatus.CLOSED);
    expect(closed.endedAt).not.toBeNull();
    await expect(service.endSession(userId, sessionId)).resolves.toEqual(first);
    expect(
      (
        await prisma.interviewSession.findUniqueOrThrow({
          where: { id: sessionId },
        })
      ).endedAt,
    ).toEqual(closed.endedAt);
  });

  it('discards a transcript whose STT completes after closing', async () => {
    let release!: (value: string) => void;
    transcribeLiveChunk.mockReturnValue(
      new Promise<string>((resolve) => {
        release = resolve;
      }),
    );
    const pending = service.addTranscript(
      userId,
      sessionId,
      { transcript: 'late' },
      randomUUID(),
    );
    await new Promise((resolve) => setImmediate(resolve));
    await service.endSession(userId, sessionId);
    release('late');

    await expect(pending).rejects.toMatchObject({
      response: { code: 'SESSION_CLOSED' },
    });
    expect(await prisma.transcriptChunk.count()).toBe(0);
  });

  it('discards a generated answer whose LLM completes after closing', async () => {
    await service.addTranscript(
      userId,
      sessionId,
      { transcript: 'Question?' },
      randomUUID(),
    );
    let release!: (value: typeof generatedAnswer) => void;
    generateSuggestedAnswer.mockReturnValue(
      new Promise<typeof generatedAnswer>((resolve) => {
        release = resolve;
      }),
    );
    const pending = service.generateResponse(
      userId,
      sessionId,
      {},
      randomUUID(),
    );
    await new Promise((resolve) => setImmediate(resolve));
    await service.endSession(userId, sessionId);
    release(generatedAnswer);

    await expect(pending).rejects.toMatchObject({
      response: { code: 'SESSION_CLOSED' },
    });
    expect(await prisma.suggestedResponse.count()).toBe(0);
  });
});
