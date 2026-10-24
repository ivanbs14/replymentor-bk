import { NotFoundException } from '@nestjs/common';
import type { PrismaService } from '../prisma.service';
import type { AiService } from '../ai/ai.service';
import { buildGenerationFingerprint } from './idempotency';
import { InterviewService } from './interview.service';
import type { HybridQuestionDetector } from './question-detection/hybrid-question-detector';
import type {
  DeterministicQuestionDetectionResult,
  QuestionDetectionInputChunk,
} from './question-detection/deterministic-question-detector';

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
  type DetectionCreateInput = {
    data: {
      sessionId: string;
      status: string;
      question: string | null;
      confidence: number | null;
      source: string;
      detectorVersion: string;
      evidence: unknown[];
      idempotencyKey: string;
      requestFingerprint: string;
    };
  };
  type ResponseCreateInput = {
    data: typeof answer & {
      sessionId: string;
      detectionId: string;
      idempotencyKey: string;
      requestFingerprint: string;
    };
  };
  let persistedDetection: Record<string, unknown> | null = null;
  const transcriptFindMany = jest.fn().mockResolvedValue([]);
  const tx = {
    $queryRaw: jest
      .fn()
      .mockImplementation((query: { values: unknown[] }) =>
        Promise.resolve(query.values.includes('user-a') ? [session] : []),
      ),
    interviewSession: { update: jest.fn() },
    transcriptChunk: {
      findFirst: jest.fn(),
      findMany: transcriptFindMany,
      create: jest.fn(),
    },
    questionDetection: {
      findFirst: jest.fn(() => Promise.resolve(persistedDetection)),
      create: jest.fn(({ data }: DetectionCreateInput) => {
        persistedDetection = {
          ...data,
          id: 'detection-a',
          provider: Reflect.get(data, 'provider') ?? null,
          model: Reflect.get(data, 'model') ?? null,
          createdAt: new Date('2026-01-01T00:00:00Z'),
          response: null,
        };
        return Promise.resolve(persistedDetection);
      }),
    },
    suggestedResponse: {
      findFirst: jest.fn(),
      findMany: jest.fn().mockResolvedValue([]),
      create: jest.fn(({ data }: ResponseCreateInput) => {
        const response = {
          ...data,
          id: 'response-a',
          createdAt: new Date('2026-01-01T00:00:00Z'),
        };
        if (persistedDetection) persistedDetection.response = response;
        return Promise.resolve(response);
      }),
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
      findMany: transcriptFindMany,
    },
    questionDetection: { findFirst: jest.fn() },
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
  const hybrid = {
    detect: jest.fn<
      ReturnType<HybridQuestionDetector['detect']>,
      Parameters<HybridQuestionDetector['detect']>
    >(
      (
        _chunks: QuestionDetectionInputChunk[],
        deterministic?: DeterministicQuestionDetectionResult,
      ) =>
        Promise.resolve({
          ...deterministic!,
          source: 'DETERMINISTIC',
          approved:
            deterministic!.status === 'DETECTED' &&
            deterministic!.confidence >= 0.85,
        }),
    ),
  };
  return {
    prisma,
    tx,
    ai,
    hybrid,
    session,
    service: new InterviewService(
      prisma as unknown as PrismaService,
      ai as unknown as AiService,
      hybrid as unknown as HybridQuestionDetector,
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
      expect(prisma.questionDetection.findFirst).not.toHaveBeenCalled();
      expect(prisma.sessionSummary.findUnique).not.toHaveBeenCalled();
      expect(tx.interviewSession.update).not.toHaveBeenCalled();
      expect(tx.transcriptChunk.create).not.toHaveBeenCalled();
      expect(tx.questionDetection.create).not.toHaveBeenCalled();
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
      {} as HybridQuestionDetector,
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
      questionDetection: { findFirst: jest.fn() },
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
      {} as HybridQuestionDetector,
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
      {} as HybridQuestionDetector,
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
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
  });

  it.each([
    {
      chunks: [
        'Pergunta antiga?',
        'Como evita condições de corrida? Comentário final.',
      ],
      expected: 'Como evita condições de corrida?',
    },
    {
      chunks: [
        'Entrevistador: me explique sua forma de investigar incidentes',
        'Candidato: Eu começo reunindo evidências.',
      ],
      expected: 'me explique sua forma de investigar incidentes',
    },
  ])(
    'generates from the latest deterministic question: $expected',
    async ({ chunks, expected }) => {
      const { service, prisma, ai } = setupSession();
      prisma.transcriptChunk.findMany.mockResolvedValue(
        chunks
          .map((content, index) => ({
            id: `chunk-${index + 1}`,
            content,
            sequence: index + 1,
          }))
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

  it('persists NOT_FOUND without invoking the LLM or creating a response', async () => {
    const { service, prisma, tx, ai } = setupSession();
    prisma.transcriptChunk.findMany.mockResolvedValue([
      {
        id: 'chunk-1',
        content: 'Entrevistador: Vamos seguir para o próximo tópico.',
        sequence: 1,
      },
      {
        id: 'chunk-2',
        content: 'Candidato: Eu acompanharia os indicadores.',
        sequence: 2,
      },
    ]);

    await expect(
      service.generateResponse('user-a', 'session-a', {}, idempotencyKey),
    ).resolves.toMatchObject({
      status: 'NEEDS_CONFIRMATION',
      detection: {
        status: 'NOT_FOUND',
        question: null,
        confidence: 0,
        source: 'DETERMINISTIC',
        detectorVersion: 'deterministic-v1',
        evidence: [],
      },
      answer: null,
    });
    expect(ai.generateSuggestedAnswer).not.toHaveBeenCalled();
    expect(tx.questionDetection.create.mock.calls[0][0]).toMatchObject({
      data: {
        status: 'NOT_FOUND',
        question: null,
        source: 'DETERMINISTIC',
      },
    });
    expect(tx.suggestedResponse.create).not.toHaveBeenCalled();
  });

  it('keeps confidence from 0.50 to 0.84 ambiguous without invoking the LLM', async () => {
    const { service, prisma, tx, ai, hybrid } = setupSession();
    prisma.transcriptChunk.findMany.mockResolvedValue([
      {
        id: 'chunk-1',
        content: 'como você acompanha uma entrega depois da publicação',
        sequence: 1,
      },
    ]);

    await expect(
      service.generateResponse('user-a', 'session-a', {}, idempotencyKey),
    ).resolves.toMatchObject({
      status: 'NEEDS_CONFIRMATION',
      detection: {
        status: 'DETECTED',
        question: 'como você acompanha uma entrega depois da publicação',
        confidence: 0.76,
        source: 'DETERMINISTIC',
      },
      answer: null,
    });
    expect(ai.generateSuggestedAnswer).not.toHaveBeenCalled();
    expect(hybrid.detect).toHaveBeenCalledTimes(1);
    expect(tx.suggestedResponse.create).not.toHaveBeenCalled();
  });

  it('persists an approved LLM detection before generating from its immutable question', async () => {
    const { service, prisma, tx, ai, hybrid } = setupSession();
    prisma.transcriptChunk.findMany.mockResolvedValue([
      {
        id: 'chunk-1',
        content: 'como você acompanha uma entrega depois da publicação',
        sequence: 1,
      },
    ]);
    hybrid.detect.mockResolvedValue({
      status: 'DETECTED',
      question: 'como você acompanha uma entrega depois da publicação',
      confidence: 0.82,
      evidence: [
        {
          chunkId: 'chunk-1',
          sequence: 1,
          excerpt: 'como você acompanha uma entrega depois da publicação',
        },
      ],
      source: 'LLM',
      detectorVersion: 'hybrid-v1',
      provider: 'gemini',
      model: 'gemini-2.0-flash',
      approved: true,
    });
    ai.generateSuggestedAnswer.mockResolvedValue({
      detectedQuestion: 'pergunta alterada pelo gerador',
      suggestedAnswer: 'Resposta baseada no contexto.',
      shortVersion: 'Resposta curta.',
      keyPoints: ['APIs'],
      strategicNote: 'Seja objetivo.',
    });

    await expect(
      service.generateResponse('user-a', 'session-a', {}, idempotencyKey),
    ).resolves.toMatchObject({
      status: 'ANSWER_READY',
      detection: {
        source: 'LLM',
        detectorVersion: 'hybrid-v1',
        provider: 'gemini',
        model: 'gemini-2.0-flash',
      },
      answer: {
        detectedQuestion:
          'como você acompanha uma entrega depois da publicação',
      },
    });
    expect(
      tx.questionDetection.create.mock.invocationCallOrder[0],
    ).toBeLessThan(tx.suggestedResponse.create.mock.invocationCallOrder[0]);
    expect(ai.generateSuggestedAnswer).toHaveBeenCalledWith(
      expect.objectContaining({
        detectedQuestion:
          'como você acompanha uma entrega depois da publicação',
      }),
    );
    expect(tx.suggestedResponse.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          detectedQuestion:
            'como você acompanha uma entrega depois da publicação',
        }) as unknown,
      }),
    );
  });

  it('uses an explicit trimmed question instead of the detected question', async () => {
    const { service, prisma, tx, ai } = setupSession();
    prisma.transcriptChunk.findMany.mockResolvedValue([
      { id: 'chunk-1', content: 'Última pergunta?', sequence: 1 },
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
    expect(tx.questionDetection.create).toHaveBeenCalled();
    expect(tx.questionDetection.create.mock.calls[0][0]).toMatchObject({
      data: {
        status: 'DETECTED',
        question: 'Pergunta escolhida?',
        confidence: null,
        source: 'MANUAL',
        detectorVersion: 'manual-v1',
        evidence: [],
      },
    });
  });

  it('persists deterministic evidence and returns the discriminated contract', async () => {
    const { service, prisma, tx } = setupSession();
    prisma.transcriptChunk.findMany.mockResolvedValue([
      { id: 'chunk-1', content: 'Como você testa mudanças?', sequence: 1 },
    ]);

    await expect(
      service.generateResponse('user-a', 'session-a', {}, idempotencyKey),
    ).resolves.toMatchObject({
      status: 'ANSWER_READY',
      detection: {
        id: 'detection-a',
        question: 'Como você testa mudanças?',
        confidence: 0.92,
        source: 'DETERMINISTIC',
        detectorVersion: 'deterministic-v1',
        evidence: [
          {
            chunkId: 'chunk-1',
            sequence: 1,
            excerpt: 'Como você testa mudanças?',
          },
        ],
      },
      answer: {
        id: 'response-a',
        detectedQuestion: 'Como você testa mudanças?',
      },
      detectedQuestion: 'Como você testa mudanças?',
    });
    expect(tx.suggestedResponse.create).toHaveBeenCalled();
    expect(tx.suggestedResponse.create.mock.calls[0][0]).toMatchObject({
      data: { detectionId: 'detection-a' },
    });
  });

  it('limits evidence to the question instead of unrelated leading text', async () => {
    const { service, prisma } = setupSession();
    const question = 'Como você testa mudanças?';
    prisma.transcriptChunk.findMany.mockResolvedValue([
      {
        id: 'chunk-1',
        content: `${'contexto sensível '.repeat(30)}\n${question}`,
        sequence: 1,
      },
    ]);

    await expect(
      service.generateResponse('user-a', 'session-a', {}, idempotencyKey),
    ).resolves.toMatchObject({
      detection: {
        evidence: [{ excerpt: question }],
      },
    });
  });

  it('replays a persisted detection before invoking the provider', async () => {
    const { service, prisma, ai } = setupSession();
    const expectedFingerprint = buildGenerationFingerprint({
      forceQuestion: undefined,
      provider: 'gemini',
      model: 'gemini-2.0-flash',
    });
    prisma.questionDetection.findFirst.mockResolvedValue({
      id: 'detection-existing',
      sessionId: 'session-a',
      status: 'DETECTED',
      question: 'Pergunta persistida?',
      confidence: null,
      source: 'LEGACY',
      detectorVersion: 'legacy-v1',
      evidence: [],
      provider: null,
      model: null,
      idempotencyKey,
      requestFingerprint: expectedFingerprint,
      createdAt: new Date('2026-01-01T00:00:00Z'),
      response: {
        id: 'response-existing',
        detectedQuestion: 'Pergunta persistida?',
        suggestedAnswer: 'Resposta persistida.',
        shortVersion: 'Resposta.',
        keyPoints: ['persistência'],
        strategicNote: 'Sem nova chamada.',
        createdAt: new Date('2026-01-01T00:00:00Z'),
      },
    });
    await expect(
      service.generateResponse('user-a', 'session-a', {}, idempotencyKey),
    ).resolves.toMatchObject({
      status: 'ANSWER_READY',
      answer: { id: 'response-existing' },
    });
    expect(ai.generateSuggestedAnswer).not.toHaveBeenCalled();
  });

  it('returns NEEDS_CONFIRMATION when replaying a detection without response', async () => {
    const { service, prisma, ai } = setupSession();
    const expectedFingerprint = buildGenerationFingerprint({
      forceQuestion: undefined,
      provider: 'gemini',
      model: 'gemini-2.0-flash',
    });
    prisma.questionDetection.findFirst.mockResolvedValue({
      id: 'detection-not-found',
      sessionId: 'session-a',
      status: 'NOT_FOUND',
      question: null,
      confidence: null,
      source: 'DETERMINISTIC',
      detectorVersion: 'detector-v1',
      evidence: [],
      provider: null,
      model: null,
      idempotencyKey,
      requestFingerprint: expectedFingerprint,
      createdAt: new Date('2026-01-01T00:00:00Z'),
      response: null,
    });

    await expect(
      service.generateResponse('user-a', 'session-a', {}, idempotencyKey),
    ).resolves.toMatchObject({
      status: 'NEEDS_CONFIRMATION',
      detection: {
        id: 'detection-not-found',
        status: 'NOT_FOUND',
        question: null,
      },
      answer: null,
    });
    expect(ai.generateSuggestedAnswer).not.toHaveBeenCalled();
  });
});
