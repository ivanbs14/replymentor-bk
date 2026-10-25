import type { AiService } from '../ai/ai.service';
import type { PrismaService } from '../prisma.service';
import { SessionSummaryProcessor } from './session-summary.processor';

const readyJson = JSON.stringify({
  overview: 'Síntese fiel.',
  questions: [
    {
      question: 'Como você projeta APIs?',
      answerSummary: 'Explicou contratos.',
    },
  ],
  topics: ['APIs'],
  strengths: [{ text: 'Trouxe um exemplo.', evidenceResponseId: 'response-a' }],
  improvements: [],
  nextSteps: ['Revisar observabilidade.'],
});

function setup(raw = readyJson) {
  let claimQuery: unknown;
  const tx = {
    sessionSummary: { updateMany: jest.fn().mockResolvedValue({ count: 0 }) },
    $queryRaw: jest.fn((query: unknown) => {
      claimQuery = query;
      return Promise.resolve([{ id: 'summary-a' }]);
    }),
  };
  const response = {
    id: 'response-a',
    detectedQuestion: 'Como você projeta APIs?',
    suggestedAnswer: 'Uso contratos.',
    createdAt: new Date(),
    detection: { provider: 'gemini', model: 'gemini-2.0-flash' },
  };
  const prisma = {
    $transaction: jest.fn((callback: (client: typeof tx) => unknown) =>
      callback(tx),
    ),
    sessionSummary: {
      findUnique: jest.fn().mockResolvedValue({
        id: 'summary-a',
        status: 'PROCESSING',
        session: {
          context: {
            resumeText: 'Backend',
            interviewType: 'Técnica',
            jobLevel: 'Sênior',
            jobDescription: 'APIs',
            companyName: 'Empresa',
            companySegment: null,
          },
          suggestedResponse: [response],
        },
      }),
      update: jest.fn().mockResolvedValue({}),
    },
  };
  const ai = {
    resolveGenerationTarget: jest
      .fn()
      .mockReturnValue({ provider: 'gemini', model: 'gemini-2.0-flash' }),
    generateSessionSummary: jest.fn().mockResolvedValue(raw),
  };
  return {
    processor: new SessionSummaryProcessor(
      prisma as unknown as PrismaService,
      ai as unknown as AiService,
    ),
    prisma,
    tx,
    ai,
    getClaimQuery: () => claimQuery,
  };
}

describe('SessionSummaryProcessor', () => {
  it('claims atomically and stores a validated ready result', async () => {
    const { processor, prisma, tx, ai, getClaimQuery } = setup();
    await expect(processor.drainOnce()).resolves.toBe(true);
    expect(JSON.stringify(tx.sessionSummary.updateMany.mock.calls)).toContain(
      '"errorCode":"WORKER_INTERRUPTED"',
    );
    const query = getClaimQuery();
    const sql = Array.isArray(Reflect.get(query as object, 'strings'))
      ? (Reflect.get(query as object, 'strings') as string[]).join('')
      : String(query);
    expect(sql).toContain('FOR UPDATE SKIP LOCKED');
    expect(sql).toContain('"providerCallStartedAt" IS NULL');
    expect(ai.generateSessionSummary).toHaveBeenCalledTimes(1);
    const updateCalls = JSON.stringify(prisma.sessionSummary.update.mock.calls);
    expect(updateCalls).toContain('"status":"READY"');
    expect(updateCalls).toContain('"evidenceResponseIds":["response-a"]');
  });

  it('fails the whole job for invalid JSON without partial content', async () => {
    const { processor, prisma } = setup('{invalid');
    await processor.drainOnce();
    const updateCalls = JSON.stringify(prisma.sessionSummary.update.mock.calls);
    expect(updateCalls).toContain('"status":"FAILED"');
    expect(updateCalls).toContain('"errorCode":"INVALID_PROVIDER_RESPONSE"');
  });

  it('completes a zero-response session without calling a provider', async () => {
    const { processor, prisma, ai } = setup();
    prisma.sessionSummary.findUnique.mockResolvedValue({
      id: 'summary-a',
      status: 'PROCESSING',
      session: { context: {}, suggestedResponse: [] },
    });
    await processor.drainOnce();
    expect(ai.generateSessionSummary).not.toHaveBeenCalled();
    const updateCalls = JSON.stringify(prisma.sessionSummary.update.mock.calls);
    expect(updateCalls).toContain('"status":"READY"');
    expect(updateCalls).toContain('"evidenceResponseIds":[]');
  });
});
