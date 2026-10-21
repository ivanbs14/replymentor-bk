import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, SessionStatus } from '@prisma/client';
import { PrismaService } from '../prisma.service';
import { AiService } from '../ai/ai.service';
import type {
  AddTranscriptDto,
  CreateInterviewContextDto,
  GenerateResponseDto,
  StartSessionDto,
} from './dto/interview.dto';
import {
  buildGenerationFingerprint,
  buildTranscriptFingerprint,
} from './idempotency';

type LockedSession = {
  id: string;
  status: SessionStatus;
  nextTranscriptSequence: number;
};

@Injectable()
export class InterviewService {
  private readonly maxChunksForGeneration = 8;

  constructor(
    private readonly prisma: PrismaService,
    private readonly ai: AiService,
  ) {}

  async createContext(userId: string, payload: CreateInterviewContextDto) {
    return this.prisma.interviewContext.create({
      data: {
        ...payload,
        userId,
      },
    });
  }

  async getLatestContext(userId: string) {
    const context = await this.prisma.interviewContext.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    if (!context) {
      throw new NotFoundException('Nenhum contexto de entrevista encontrado.');
    }
    return context;
  }

  async listContexts(userId: string) {
    const contexts = await this.prisma.interviewContext.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        sessions: {
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            status: true,
            startedAt: true,
            endedAt: true,
            createdAt: true,
          },
        },
      },
    });

    return contexts.map((context) => ({
      id: context.id,
      resumeText: context.resumeText,
      interviewType: context.interviewType,
      jobLevel: context.jobLevel,
      jobDescription: context.jobDescription,
      companyName: context.companyName,
      companySegment: context.companySegment,
      responsePreference: context.responsePreference,
      aiBehavior: context.aiBehavior,
      createdAt: context.createdAt,
      updatedAt: context.updatedAt,
      sessionsCount: context.sessions.length,
      latestSessionAt: context.sessions[0]?.createdAt ?? null,
      latestSessionStatus: context.sessions[0]?.status ?? null,
    }));
  }

  async startSession(userId: string, payload: StartSessionDto) {
    const context = await this.prisma.interviewContext.findUnique({
      where: { id: payload.contextId },
    });
    if (!context) {
      throw new NotFoundException('Contexto de entrevista não encontrado.');
    }
    if (context.userId !== userId) {
      throw new NotFoundException('Contexto de entrevista não encontrado.');
    }

    try {
      return await this.prisma.interviewSession.create({
        data: { contextId: payload.contextId, status: SessionStatus.ACTIVE },
      });
    } catch (error) {
      if (
        this.isUniqueConflict(
          error,
          'contextId',
          'InterviewSession_one_active_per_context',
        )
      ) {
        throw new ConflictException({
          code: 'ACTIVE_SESSION_EXISTS',
          message: 'Este contexto já possui uma sessão ativa.',
        });
      }
      throw error;
    }
  }

  async addTranscript(
    userId: string,
    sessionId: string,
    payload: AddTranscriptDto,
    idempotencyKey: string,
  ) {
    const session = await this.prisma.interviewSession.findUnique({
      where: { id: sessionId },
      include: { context: true },
    });
    if (!session) {
      throw new NotFoundException('Sessão não encontrada.');
    }
    if (session.context.userId !== userId) {
      throw new NotFoundException('Sessão não encontrada.');
    }
    const requestFingerprint = buildTranscriptFingerprint(payload);
    const existing = await this.prisma.transcriptChunk.findFirst({
      where: { sessionId, idempotencyKey },
    });
    if (existing) {
      this.assertMatchingFingerprint(
        existing.requestFingerprint,
        requestFingerprint,
      );
      return existing;
    }
    this.assertActive(session.status);

    const transcript = await this.ai.transcribeLiveChunk({
      transcript: payload.transcript,
      audioBase64: payload.audioBase64,
      mimeType: payload.mimeType,
    });

    return this.prisma.$transaction(async (tx) => {
      const locked = await this.lockOwnedSession(tx, userId, sessionId);
      const replay = await tx.transcriptChunk.findFirst({
        where: { sessionId, idempotencyKey },
      });
      if (replay) {
        this.assertMatchingFingerprint(
          replay.requestFingerprint,
          requestFingerprint,
        );
        return replay;
      }
      this.assertActive(locked.status);

      await tx.interviewSession.update({
        where: { id: sessionId },
        data: { nextTranscriptSequence: { increment: 1 } },
      });
      return tx.transcriptChunk.create({
        data: {
          sessionId,
          sequence: locked.nextTranscriptSequence,
          content: transcript,
          source: payload.transcript ? 'manual' : 'stt',
          idempotencyKey,
          requestFingerprint,
        },
      });
    });
  }

  async generateResponse(
    userId: string,
    sessionId: string,
    payload: GenerateResponseDto,
    idempotencyKey: string,
  ) {
    const session = await this.prisma.interviewSession.findUnique({
      where: { id: sessionId },
      include: { context: true },
    });
    if (!session) {
      throw new NotFoundException('Sessão não encontrada.');
    }
    if (session.context.userId !== userId) {
      throw new NotFoundException('Sessão não encontrada.');
    }
    const target = this.ai.resolveGenerationTarget(
      payload.provider,
      payload.model,
    );
    const requestFingerprint = buildGenerationFingerprint({
      forceQuestion: payload.forceQuestion,
      ...target,
    });
    const existing = await this.prisma.suggestedResponse.findFirst({
      where: { sessionId, idempotencyKey },
    });
    if (existing) {
      this.assertMatchingFingerprint(
        existing.requestFingerprint,
        requestFingerprint,
      );
      return this.toSuggestedResponse(existing);
    }
    this.assertActive(session.status);

    const latestChunks = await this.prisma.transcriptChunk.findMany({
      where: { sessionId },
      orderBy: { sequence: 'desc' },
      take: this.maxChunksForGeneration,
    });
    if (latestChunks.length === 0) {
      throw new BadRequestException('Não há transcrição para gerar resposta.');
    }

    const chunks = latestChunks.reverse();
    const transcriptWindow = chunks.map((item) => item.content).join('\n');
    const detectedQuestion =
      payload.forceQuestion?.trim() ??
      this.detectLatestQuestion(transcriptWindow) ??
      'Pode resumir sua experiência para essa vaga?';

    const generated = await this.ai.generateSuggestedAnswer({
      context: {
        resumeText: session.context.resumeText,
        interviewType: session.context.interviewType,
        jobLevel: session.context.jobLevel,
        jobDescription: session.context.jobDescription,
        companyName: session.context.companyName,
        companySegment: session.context.companySegment ?? undefined,
        responsePreference: session.context.responsePreference,
        aiBehavior: session.context.aiBehavior ?? undefined,
      },
      detectedQuestion,
      transcriptWindow,
      provider: target.provider,
      model: target.model,
    });

    const saved = await this.prisma.$transaction(async (tx) => {
      const locked = await this.lockOwnedSession(tx, userId, sessionId);
      const replay = await tx.suggestedResponse.findFirst({
        where: { sessionId, idempotencyKey },
      });
      if (replay) {
        this.assertMatchingFingerprint(
          replay.requestFingerprint,
          requestFingerprint,
        );
        return replay;
      }
      this.assertActive(locked.status);
      return tx.suggestedResponse.create({
        data: {
          sessionId,
          detectedQuestion: generated.detectedQuestion,
          suggestedAnswer: generated.suggestedAnswer,
          shortVersion: generated.shortVersion,
          keyPoints: generated.keyPoints,
          strategicNote: generated.strategicNote,
          idempotencyKey,
          requestFingerprint,
        },
      });
    });

    return this.toSuggestedResponse(saved);
  }

  async endSession(userId: string, sessionId: string) {
    return this.prisma.$transaction(async (tx) => {
      const session = await this.lockOwnedSession(tx, userId, sessionId);
      if (session.status === SessionStatus.CLOSED) {
        const existing = await tx.sessionSummary.findUnique({
          where: { sessionId },
        });
        if (!existing) {
          throw new NotFoundException('Resumo da sessão não encontrado.');
        }
        return existing;
      }

      const responses = await tx.suggestedResponse.findMany({
        where: { sessionId },
        orderBy: { createdAt: 'asc' },
      });
      const content =
        responses.length === 0
          ? 'Sessão encerrada sem respostas sugeridas registradas.'
          : `Sessão encerrada com ${responses.length} respostas sugeridas.`;
      const topics = responses
        .map((response) => response.detectedQuestion)
        .slice(-10);

      await tx.interviewSession.update({
        where: { id: sessionId },
        data: { status: SessionStatus.CLOSED, endedAt: new Date() },
      });
      return tx.sessionSummary.create({
        data: { sessionId, content, topics },
      });
    });
  }

  async getSummary(userId: string, sessionId: string) {
    const session = await this.prisma.interviewSession.findUnique({
      where: { id: sessionId },
      include: { context: true },
    });
    if (!session || session.context.userId !== userId) {
      throw new NotFoundException('Resumo da sessão não encontrado.');
    }

    const summary = await this.prisma.sessionSummary.findUnique({
      where: { sessionId },
    });
    if (!summary) {
      throw new NotFoundException('Resumo da sessão não encontrado.');
    }
    return summary;
  }

  private detectLatestQuestion(transcriptWindow: string): string | null {
    const lines = transcriptWindow
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

    for (let i = lines.length - 1; i >= 0; i -= 1) {
      const line = lines[i];
      if (line.endsWith('?')) {
        return line;
      }
    }

    return lines.length > 0 ? lines[lines.length - 1] : null;
  }

  private async lockOwnedSession(
    tx: Prisma.TransactionClient,
    userId: string,
    sessionId: string,
  ): Promise<LockedSession> {
    const rows = await tx.$queryRaw<LockedSession[]>(Prisma.sql`
      SELECT session."id", session."status", session."nextTranscriptSequence"
      FROM "InterviewSession" AS session
      INNER JOIN "InterviewContext" AS context ON context."id" = session."contextId"
      WHERE session."id" = ${sessionId} AND context."userId" = ${userId}
      FOR UPDATE OF session
    `);
    const session = rows[0];
    if (!session) {
      throw new NotFoundException('Sessão não encontrada.');
    }
    return session;
  }

  private assertActive(status: SessionStatus): void {
    if (status !== SessionStatus.ACTIVE) {
      throw new ConflictException({
        code: 'SESSION_CLOSED',
        message: 'A sessão já foi encerrada.',
      });
    }
  }

  private assertMatchingFingerprint(
    stored: string | null,
    received: string,
  ): void {
    if (stored !== received) {
      throw new ConflictException({
        code: 'IDEMPOTENCY_KEY_REUSED',
        message: 'Idempotency-Key já utilizada com outro payload.',
      });
    }
  }

  private isUniqueConflict(
    error: unknown,
    ...expectedTargets: string[]
  ): boolean {
    if (
      !(error instanceof Prisma.PrismaClientKnownRequestError) ||
      error.code !== 'P2002'
    ) {
      return false;
    }
    const target = error.meta?.target;
    const fields = Array.isArray(target)
      ? target.filter((item): item is string => typeof item === 'string')
      : typeof target === 'string'
        ? [target]
        : [];
    return expectedTargets.some((expected) =>
      fields.some((field) => field.includes(expected)),
    );
  }

  private toSuggestedResponse(response: {
    id: string;
    detectedQuestion: string;
    suggestedAnswer: string;
    shortVersion: string;
    keyPoints: string[];
    strategicNote: string;
    createdAt: Date;
  }) {
    return {
      id: response.id,
      detectedQuestion: response.detectedQuestion,
      suggestedAnswer: response.suggestedAnswer,
      shortVersion: response.shortVersion,
      keyPoints: response.keyPoints,
      strategicNote: response.strategicNote,
      createdAt: response.createdAt,
    };
  }
}
