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
    const rejected = results.find(({ status }) => status === 'rejected');
    expect(rejected).toMatchObject({
      reason: { response: { code: 'ACTIVE_SESSION_EXISTS' } },
    });
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
      { transcript: 'Como você testa concorrência?' },
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
    expect(await prisma.questionDetection.count()).toBe(0);
  });

  it('persists one generated response for simultaneous retries with the same key', async () => {
    await service.addTranscript(
      userId,
      sessionId,
      { transcript: 'Como você testa concorrência?' },
      randomUUID(),
    );
    const key = randomUUID();
    const [first, second] = await Promise.all([
      service.generateResponse(userId, sessionId, {}, key),
      service.generateResponse(userId, sessionId, {}, key),
    ]);

    expect(first.status).toBe('ANSWER_READY');
    expect(second.status).toBe('ANSWER_READY');
    if (first.status !== 'ANSWER_READY' || second.status !== 'ANSWER_READY') {
      throw new Error('Expected ANSWER_READY results.');
    }
    expect(first.answer.id).toBe(second.answer.id);
    expect(first.detection.id).toBe(second.detection.id);
    expect(generateSuggestedAnswer).toHaveBeenCalledTimes(1);
    expect(await prisma.suggestedResponse.count()).toBe(1);
    expect(await prisma.questionDetection.count()).toBe(1);
  });

  it('rejects reuse of a generation key with a different fingerprint', async () => {
    await service.addTranscript(
      userId,
      sessionId,
      { transcript: 'Como você testa concorrência?' },
      randomUUID(),
    );
    const key = randomUUID();
    await service.generateResponse(
      userId,
      sessionId,
      { provider: 'gemini', model: 'gemini-2.0-flash' },
      key,
    );

    await expect(
      service.generateResponse(
        userId,
        sessionId,
        { forceQuestion: 'Different question?' },
        key,
      ),
    ).rejects.toMatchObject({
      response: { code: 'IDEMPOTENCY_KEY_REUSED' },
    });
    expect(await prisma.suggestedResponse.count()).toBe(1);
    expect(await prisma.questionDetection.count()).toBe(1);
  });

  it('keeps chunks and responses immutable after closing', async () => {
    await service.addTranscript(
      userId,
      sessionId,
      { transcript: 'Como você testa concorrência?' },
      randomUUID(),
    );
    await service.generateResponse(userId, sessionId, {}, randomUUID());
    await service.endSession(userId, sessionId);
    const before = {
      chunks: await prisma.transcriptChunk.count(),
      responses: await prisma.suggestedResponse.count(),
      detections: await prisma.questionDetection.count(),
    };

    await expect(
      service.addTranscript(
        userId,
        sessionId,
        { transcript: 'Late question?' },
        randomUUID(),
      ),
    ).rejects.toMatchObject({ response: { code: 'SESSION_CLOSED' } });
    await expect(
      service.generateResponse(userId, sessionId, {}, randomUUID()),
    ).rejects.toMatchObject({ response: { code: 'SESSION_CLOSED' } });
    expect(await prisma.transcriptChunk.count()).toBe(before.chunks);
    expect(await prisma.suggestedResponse.count()).toBe(before.responses);
    expect(await prisma.questionDetection.count()).toBe(before.detections);
  });

  it('persists an auditable detection linked one-to-one with its response', async () => {
    const chunk = await service.addTranscript(
      userId,
      sessionId,
      { transcript: 'Como você testa concorrência?' },
      randomUUID(),
    );
    const result = await service.generateResponse(
      userId,
      sessionId,
      {},
      randomUUID(),
    );
    expect(result.status).toBe('ANSWER_READY');
    if (result.status !== 'ANSWER_READY') {
      throw new Error('Expected ANSWER_READY result.');
    }
    const stored = await prisma.questionDetection.findUniqueOrThrow({
      where: { id: result.detection.id },
      include: { response: true },
    });
    expect(stored).toMatchObject({
      status: 'DETECTED',
      question: 'Como você testa concorrência?',
      confidence: 0.92,
      source: 'DETERMINISTIC',
      detectorVersion: 'deterministic-v1',
      evidence: [
        {
          chunkId: chunk.id,
          sequence: chunk.sequence,
          excerpt: 'Como você testa concorrência?',
        },
      ],
      response: { id: result.answer.id, detectionId: stored.id },
    });
  });

  it('keeps migration backfill, indexes, and legacy nullable keys compatible', async () => {
    await prisma.transcriptChunk.createMany({
      data: [
        { sessionId, sequence: 3, content: 'legacy 3' },
        { sessionId, sequence: 7, content: 'legacy 7' },
      ],
    });
    await prisma.interviewSession.update({
      where: { id: sessionId },
      data: { nextTranscriptSequence: 1 },
    });
    await prisma.$executeRawUnsafe(`
      UPDATE "InterviewSession" AS session
      SET "nextTranscriptSequence" = chunks."nextSequence"
      FROM (
        SELECT "sessionId", COALESCE(MAX("sequence"), 0) + 1 AS "nextSequence"
        FROM "TranscriptChunk"
        GROUP BY "sessionId"
      ) AS chunks
      WHERE chunks."sessionId" = session."id"
    `);
    expect(
      (
        await prisma.interviewSession.findUniqueOrThrow({
          where: { id: sessionId },
        })
      ).nextTranscriptSequence,
    ).toBe(8);
    expect(
      await prisma.transcriptChunk.count({
        where: { idempotencyKey: null, requestFingerprint: null },
      }),
    ).toBe(2);

    const indexes = await prisma.$queryRaw<Array<{ indexname: string }>>`
      SELECT indexname
      FROM pg_indexes
      WHERE schemaname = 'public'
        AND indexname IN (
          'InterviewSession_one_active_per_context',
          'TranscriptChunk_session_idempotency_key',
          'SuggestedResponse_session_idempotency_key',
          'QuestionDetection_session_idempotency_key',
          'QuestionDetection_sessionId_id_key',
          'SuggestedResponse_detectionId_key',
          'SuggestedResponse_sessionId_detectionId_key'
        )
    `;
    expect(indexes.map(({ indexname }) => indexname).sort()).toEqual([
      'InterviewSession_one_active_per_context',
      'QuestionDetection_sessionId_id_key',
      'QuestionDetection_session_idempotency_key',
      'SuggestedResponse_detectionId_key',
      'SuggestedResponse_sessionId_detectionId_key',
      'SuggestedResponse_session_idempotency_key',
      'TranscriptChunk_session_idempotency_key',
    ]);
  });

  it('rejects linking a response to a detection from another session', async () => {
    const otherUser = await prisma.user.create({
      data: {
        email: 'other-session@example.com',
        passwordHash: 'unused',
      },
    });
    const otherContext = await prisma.interviewContext.create({
      data: {
        userId: otherUser.id,
        resumeText: 'R'.repeat(50),
        interviewType: 'Técnica (Coding/System Design)',
        jobLevel: 'Pleno',
        jobDescription: 'D'.repeat(20),
        companyName: 'Other company',
        responsePreference: 'equilibrada',
      },
    });
    const otherSession = await prisma.interviewSession.create({
      data: { contextId: otherContext.id },
    });
    const detection = await prisma.questionDetection.create({
      data: {
        sessionId,
        status: 'DETECTED',
        question: 'Question?',
        source: 'LEGACY',
        detectorVersion: 'legacy-v1',
        evidence: [],
      },
    });

    await expect(
      prisma.suggestedResponse.create({
        data: {
          sessionId: otherSession.id,
          detectionId: detection.id,
          detectedQuestion: 'Question?',
          suggestedAnswer: 'Answer.',
          shortVersion: 'Answer.',
          keyPoints: [],
          strategicNote: 'Be concise.',
        },
      }),
    ).rejects.toThrow();
  });

  it('reports duplicate context ids during the migration preflight', async () => {
    await prisma.$executeRawUnsafe(
      'DROP INDEX "InterviewSession_one_active_per_context"',
    );
    try {
      await prisma.interviewSession.create({ data: { contextId } });
      const preflight = `
        DO $$
        DECLARE duplicate_contexts TEXT;
        BEGIN
          SELECT STRING_AGG(FORMAT('%s (%s)', duplicates."contextId", duplicates."activeCount"), ', ')
          INTO duplicate_contexts
          FROM (
            SELECT "contextId", COUNT(*) AS "activeCount"
            FROM "InterviewSession"
            WHERE "status" = 'ACTIVE'
            GROUP BY "contextId"
            HAVING COUNT(*) > 1
          ) AS duplicates;
          IF duplicate_contexts IS NOT NULL THEN
            RAISE EXCEPTION 'FEAT-010 preflight: multiple ACTIVE sessions: %', duplicate_contexts;
          END IF;
        END $$;
      `;
      await expect(prisma.$executeRawUnsafe(preflight)).rejects.toThrow(
        contextId,
      );
    } finally {
      await prisma.interviewSession.deleteMany({
        where: { contextId, id: { not: sessionId } },
      });
      await prisma.$executeRawUnsafe(`
        CREATE UNIQUE INDEX "InterviewSession_one_active_per_context"
        ON "InterviewSession" ("contextId")
        WHERE "status" = 'ACTIVE'
      `);
    }
  });
});
