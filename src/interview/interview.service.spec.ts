import { NotFoundException } from '@nestjs/common';
import type { PrismaService } from '../prisma.service';
import type { AiService } from '../ai/ai.service';
import { InterviewService } from './interview.service';

const idempotencyKey = '550e8400-e29b-41d4-a716-446655440000';
const context = {
  id: 'context-a',
  userId: 'user-a',
  resumeText:
    'Engenheiro de software com experiência em APIs Node.js e PostgreSQL.',
  interviewType: 'Técnica (Coding/System Design)',
  jobLevel: 'Sênior',
  jobDescription: 'Desenvolvimento de APIs concorrentes.',
  companyName: 'Empresa Exemplo',
  companySegment: 'Tecnologia',
  responsePreference: 'direta e curta',
  aiBehavior: null,
};

function setupSession() {
  const session = {
    id: 'session-a',
    status: 'ACTIVE',
    nextTranscriptSequence: 3,
    context,
  };
  const answer = {
    detectedQuestion: 'Pergunta?',
    suggestedAnswer: 'Resposta baseada no contexto.',
    shortVersion: 'Resposta curta.',
    keyPoints: ['APIs'],
    strategicNote: 'Seja objetivo.',
  };
  const tx = {
    $queryRaw: jest
      .fn()
      .mockImplementation((query: { values: unknown[] }) =>
        Promise.resolve(query.values.includes('user-a') ? [session] : []),
      ),
    interviewSession: { update: jest.fn() },
    transcriptChunk: { findFirst: jest.fn(), create: jest.fn() },
    suggestedResponse: {
      findFirst: jest.fn(),
      findMany: jest.fn().mockResolvedValue([]),
      create: jest
        .fn()
        .mockImplementation(({ data }: { data: typeof answer }) =>
          Promise.resolve({
            ...data,
            id: 'response-a',
            createdAt: new Date('2026-01-01T00:00:00Z'),
          }),
        ),
    },
    sessionSummary: { findUnique: jest.fn(), create: jest.fn() },
  };
  const prisma = {
    interviewContext: {
      findUnique: jest.fn().mockResolvedValue(context),
      findFirst: jest.fn().mockResolvedValue(context),
      findMany: jest.fn().mockResolvedValue([]),
      create: jest.fn(),
    },
    interviewSession: {
      findUnique: jest.fn().mockResolvedValue(session),
      create: jest.fn(),
    },
    transcriptChunk: {
      findFirst: jest.fn(),
      findMany: jest.fn().mockResolvedValue([]),
    },
    suggestedResponse: { findFirst: jest.fn() },
    sessionSummary: { findUnique: jest.fn() },
    $transaction: jest.fn((callback: (client: typeof tx) => unknown) =>
      callback(tx),
    ),
  };
  const ai = {
    resolveGenerationTarget: jest
      .fn()
      .mockReturnValue({ provider: 'gemini', model: 'gemini-2.0-flash' }),
    transcribeLiveChunk: jest.fn().mockResolvedValue('Transcrição.'),
    generateSuggestedAnswer: jest.fn().mockResolvedValue(answer),
  };
  return {
    prisma,
    tx,
    ai,
    session,
    service: new InterviewService(
      prisma as unknown as PrismaService,
      ai as unknown as AiService,
    ),
  };
}

describe('InterviewService isolation', () => {
  it('creates a context owned by the authenticated user', async () => {
    const { service, prisma } = setupSession();
    const payload = {
      resumeText: context.resumeText,
      interviewType: context.interviewType,
      jobLevel: context.jobLevel,
      jobDescription: context.jobDescription,
      companyName: context.companyName,
      responsePreference: context.responsePreference,
    };
    prisma.interviewContext.create.mockResolvedValue({
      ...payload,
      userId: 'user-b',
    });
    await expect(
      service.createContext('user-b', payload),
    ).resolves.toMatchObject({ userId: 'user-b' });
    expect(prisma.interviewContext.create).toHaveBeenCalledWith({
      data: { ...payload, userId: 'user-b' },
    });
  });

  it('scopes latest context and context list queries to the authenticated user', async () => {
    const { service, prisma } = setupSession();
    await service.getLatestContext('user-a');
    await service.listContexts('user-a');
    expect(prisma.interviewContext.findFirst).toHaveBeenCalledWith({
      where: { userId: 'user-a' },
      orderBy: { createdAt: 'desc' },
    });
    expect(prisma.interviewContext.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: 'user-a' },
        orderBy: { createdAt: 'desc' },
      }),
    );
  });

  it.each(['transcript', 'generation', 'summary', 'end'] as const)(
    'hides another user session during %s without provider calls or writes',
    async (operation) => {
      const { service, prisma, tx, ai } = setupSession();
      const operations = {
        transcript: () =>
          service.addTranscript(
            'user-b',
            'session-a',
            { transcript: 'Pergunta?' },
            idempotencyKey,
          ),
        generation: () =>
          service.generateResponse('user-b', 'session-a', {}, idempotencyKey),
        summary: () => service.getSummary('user-b', 'session-a'),
        end: () => service.endSession('user-b', 'session-a'),
      };
      await expect(operations[operation]()).rejects.toThrow(NotFoundException);
      expect(ai.transcribeLiveChunk).not.toHaveBeenCalled();
      expect(ai.resolveGenerationTarget).not.toHaveBeenCalled();
      expect(ai.generateSuggestedAnswer).not.toHaveBeenCalled();
      expect(prisma.transcriptChunk.findFirst).not.toHaveBeenCalled();
      expect(prisma.suggestedResponse.findFirst).not.toHaveBeenCalled();
      expect(prisma.sessionSummary.findUnique).not.toHaveBeenCalled();
      expect(tx.interviewSession.update).not.toHaveBeenCalled();
      expect(tx.transcriptChunk.create).not.toHaveBeenCalled();
      expect(tx.suggestedResponse.create).not.toHaveBeenCalled();
      expect(tx.sessionSummary.findUnique).not.toHaveBeenCalled();
      expect(tx.sessionSummary.create).not.toHaveBeenCalled();
      if (operation === 'end') {
        expect(tx.$queryRaw).toHaveBeenCalledWith(
          expect.objectContaining({ values: ['session-a', 'user-b'] }),
        );
      }
    },
  );

  it('does not expose a summary when the session is missing', async () => {
    const { service, prisma } = setupSession();
    prisma.interviewSession.findUnique.mockResolvedValue(null);
    await expect(service.getSummary('user-a', 'missing')).rejects.toThrow(
      NotFoundException,
    );
    expect(prisma.sessionSummary.findUnique).not.toHaveBeenCalled();
  });

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

  it('rejects new transcripts for a closed session before calling STT', async () => {
    const { service, session, ai, prisma } = setupSession();
    session.status = 'CLOSED';
    await expect(
      service.addTranscript(
        'user-a',
        'session-a',
        { transcript: 'Pergunta?' },
        idempotencyKey,
      ),
    ).rejects.toMatchObject({ response: { code: 'SESSION_CLOSED' } });
    expect(ai.transcribeLiveChunk).not.toHaveBeenCalled();
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('rejects generation without transcripts before invoking the LLM', async () => {
    const { service, ai, prisma } = setupSession();
    await expect(
      service.generateResponse('user-a', 'session-a', {}, idempotencyKey),
    ).rejects.toMatchObject({
      response: {
        statusCode: 400,
        message: 'Não há transcrição para gerar resposta.',
      },
    });
    expect(ai.generateSuggestedAnswer).not.toHaveBeenCalled();
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it.each([
    {
      chunks: [
        'Pergunta antiga?',
        '  Como evita condições de corrida?  \nComentário final.',
      ],
      expected: 'Como evita condições de corrida?',
    },
    {
      chunks: ['Apresentação inicial.', '  Último trecho sem interrogação.  '],
      expected: 'Último trecho sem interrogação.',
    },
    {
      chunks: ['   ', '\n'],
      expected: 'Pode resumir sua experiência para essa vaga?',
    },
  ])(
    'generates from the latest question or current fallback: $expected',
    async ({ chunks, expected }) => {
      const { service, prisma, ai } = setupSession();
      prisma.transcriptChunk.findMany.mockResolvedValue(
        chunks
          .map((content, index) => ({ content, sequence: index + 1 }))
          .reverse(),
      );
      await service.generateResponse('user-a', 'session-a', {}, idempotencyKey);
      expect(prisma.transcriptChunk.findMany).toHaveBeenCalledWith({
        where: { sessionId: 'session-a' },
        orderBy: { sequence: 'desc' },
        take: 8,
      });
      expect(ai.generateSuggestedAnswer).toHaveBeenCalledWith(
        expect.objectContaining({
          detectedQuestion: expected,
          transcriptWindow: chunks.join('\n'),
          context: expect.objectContaining({
            resumeText: context.resumeText,
            companyName: context.companyName,
          }) as unknown,
        }),
      );
    },
  );

  it('uses an explicit trimmed question instead of the detected question', async () => {
    const { service, prisma, ai } = setupSession();
    prisma.transcriptChunk.findMany.mockResolvedValue([
      { content: 'Última pergunta?', sequence: 1 },
    ]);
    await service.generateResponse(
      'user-a',
      'session-a',
      { forceQuestion: '  Pergunta escolhida?  ' },
      idempotencyKey,
    );
    expect(ai.generateSuggestedAnswer).toHaveBeenCalledWith(
      expect.objectContaining({ detectedQuestion: 'Pergunta escolhida?' }),
    );
  });
});
