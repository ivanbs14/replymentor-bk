import { NotFoundException } from '@nestjs/common';
import type { PrismaService } from '../prisma.service';
import type { AiService } from '../ai/ai.service';
import { InterviewService } from './interview.service';

describe('InterviewService isolation', () => {
  it('does not start a session from another user context', async () => {
    const prisma = {
      interviewContext: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'context-user-a',
          userId: 'user-a',
        }),
      },
      interviewSession: {
        create: jest.fn(),
      },
    };
    const service = new InterviewService(
      prisma as unknown as PrismaService,
      {} as AiService,
    );

    await expect(
      service.startSession('user-b', { contextId: 'context-user-a' }),
    ).rejects.toThrow(NotFoundException);
    expect(prisma.interviewSession.create).not.toHaveBeenCalled();
  });

  it('rejects response generation for a closed session before calling AI', async () => {
    const prisma = {
      interviewSession: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'session-a',
          status: 'CLOSED',
          context: { userId: 'user-a' },
        }),
      },
      suggestedResponse: { findFirst: jest.fn() },
    };
    const ai = {
      resolveGenerationTarget: jest.fn().mockReturnValue({
        provider: 'gemini',
        model: 'gemini-2.0-flash',
      }),
      generateSuggestedAnswer: jest.fn(),
    };
    const service = new InterviewService(
      prisma as unknown as PrismaService,
      ai as unknown as AiService,
    );

    await expect(
      service.generateResponse(
        'user-a',
        'session-a',
        {},
        '550e8400-e29b-41d4-a716-446655440000',
      ),
    ).rejects.toMatchObject({ response: { code: 'SESSION_CLOSED' } });
    expect(ai.generateSuggestedAnswer).not.toHaveBeenCalled();
  });

  it('returns the existing summary when a closed session is ended again', async () => {
    const existingSummary = {
      id: 'summary-a',
      sessionId: 'session-a',
      content: 'Existing summary',
      topics: [],
    };
    const tx = {
      $queryRaw: jest.fn().mockResolvedValue([
        {
          id: 'session-a',
          status: 'CLOSED',
          nextTranscriptSequence: 1,
        },
      ]),
      sessionSummary: {
        findUnique: jest.fn().mockResolvedValue(existingSummary),
        create: jest.fn(),
      },
      interviewSession: { update: jest.fn() },
      suggestedResponse: { findMany: jest.fn() },
    };
    const prisma = {
      $transaction: jest.fn((callback: (client: typeof tx) => unknown) =>
        callback(tx),
      ),
    };
    const service = new InterviewService(
      prisma as unknown as PrismaService,
      {} as AiService,
    );

    await expect(service.endSession('user-a', 'session-a')).resolves.toEqual(
      existingSummary,
    );
    expect(tx.interviewSession.update).not.toHaveBeenCalled();
    expect(tx.sessionSummary.create).not.toHaveBeenCalled();
  });
});
