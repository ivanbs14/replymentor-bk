import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  Prisma,
  QuestionDetectionSource,
  QuestionDetectionStatus,
  SessionStatus,
} from '@prisma/client';
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
import type {
  GenerateResponseResult,
  QuestionDetectionEvidence,
} from './question-detection.types';
import { detectLatestQuestion } from './question-detection/deterministic-question-detector';
import { HybridQuestionDetector } from './question-detection/hybrid-question-detector';

type LockedSession = {
  id: string;
  status: SessionStatus;
  nextTranscriptSequence: number;
};

@Injectable()
export class InterviewService {
  private readonly logger = new Logger(InterviewService.name);
  private readonly maxChunksForGeneration = 8;
  private readonly generationTransactionTimeoutMs =
    Math.max(Number(process.env.LLM_TIMEOUT_MS ?? '45000') || 45_000, 5_000) +
    2_000;
  private readonly sessionTransactionTimeoutMs =
    this.generationTransactionTimeoutMs * 2 + 2_000;

  constructor(
    private readonly prisma: PrismaService,
    private readonly ai: AiService,
    private readonly hybridQuestionDetector: HybridQuestionDetector,
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

    return this.prisma.$transaction(
      async (tx) => {
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
      },
      { timeout: this.sessionTransactionTimeoutMs },
    );
  }

  async generateResponse(
    userId: string,
    sessionId: string,
    payload: GenerateResponseDto,
    idempotencyKey: string,
  ): Promise<GenerateResponseResult> {
    const startedAt = performance.now();
    let outcome: 'answer_ready' | 'needs_confirmation' | 'error' = 'error';
    try {
      const result = await this.generateResponseCycle(
        userId,
        sessionId,
        payload,
        idempotencyKey,
      );
      outcome =
        result.status === 'ANSWER_READY'
          ? 'answer_ready'
          : 'needs_confirmation';
      return result;
    } finally {
      this.logger.log({
        operation: 'generate_response',
        outcome,
        durationMs: performance.now() - startedAt,
      });
    }
  }

  private async generateResponseCycle(
    userId: string,
    sessionId: string,
    payload: GenerateResponseDto,
    idempotencyKey: string,
  ): Promise<GenerateResponseResult> {
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
    const existing = await this.prisma.questionDetection.findFirst({
      where: { sessionId, idempotencyKey },
      include: { response: true },
    });
    if (existing) {
      this.assertMatchingFingerprint(
        existing.requestFingerprint,
        requestFingerprint,
      );
      if (
        existing.response ||
        !this.isDetectionApproved(existing) ||
        session.status === SessionStatus.CLOSED
      ) {
        return this.toGenerationResult(existing);
      }
    } else {
      this.assertActive(session.status);
    }

    const detection =
      existing ??
      (await this.detectAndPersist({
        userId,
        sessionId,
        forceQuestion: payload.forceQuestion?.trim(),
        idempotencyKey,
        requestFingerprint,
      }));
    if (!this.isDetectionApproved(detection)) {
      return this.toGenerationResult(detection);
    }
    return this.generateAndPersist({
      userId,
      sessionId,
      detectionId: detection.id,
      idempotencyKey,
      requestFingerprint,
      context: session.context,
      target,
    });
  }

  private async detectAndPersist(input: {
    userId: string;
    sessionId: string;
    forceQuestion?: string;
    idempotencyKey: string;
    requestFingerprint: string;
  }) {
    return this.prisma.$transaction(
      async (tx) => {
        await this.lockGenerationPhase(
          tx,
          'detection',
          input.sessionId,
          input.idempotencyKey,
        );
        const replay = await tx.questionDetection.findFirst({
          where: {
            sessionId: input.sessionId,
            idempotencyKey: input.idempotencyKey,
          },
          include: { response: true },
        });
        if (replay) {
          this.assertMatchingFingerprint(
            replay.requestFingerprint,
            input.requestFingerprint,
          );
          return replay;
        }
        const locked = await this.lockOwnedSession(
          tx,
          input.userId,
          input.sessionId,
        );
        this.assertActive(locked.status);
        const latestChunks = await tx.transcriptChunk.findMany({
          where: { sessionId: input.sessionId },
          orderBy: { sequence: 'desc' },
          take: this.maxChunksForGeneration,
        });
        if (latestChunks.length === 0) {
          throw new BadRequestException(
            'Não há transcrição para gerar resposta.',
          );
        }
        const chunks = [...latestChunks]
          .reverse()
          .map(({ id, sequence, content }) => ({ id, sequence, content }));
        const decision = input.forceQuestion
          ? {
              status: 'DETECTED' as const,
              question: input.forceQuestion,
              confidence: null,
              evidence: [],
              source: 'MANUAL' as const,
              detectorVersion: 'manual-v1',
              provider: null,
              model: null,
            }
          : await this.hybridQuestionDetector.detect(
              chunks,
              detectLatestQuestion(chunks),
            );
        const stillActive = await this.lockOwnedSession(
          tx,
          input.userId,
          input.sessionId,
        );
        this.assertActive(stillActive.status);
        const saved = await tx.questionDetection.create({
          data: {
            sessionId: input.sessionId,
            status:
              decision.status === 'DETECTED'
                ? QuestionDetectionStatus.DETECTED
                : QuestionDetectionStatus.NOT_FOUND,
            question: decision.question,
            confidence: decision.confidence,
            source:
              decision.source === 'LLM'
                ? QuestionDetectionSource.LLM
                : decision.source === 'MANUAL'
                  ? QuestionDetectionSource.MANUAL
                  : QuestionDetectionSource.DETERMINISTIC,
            detectorVersion: decision.detectorVersion,
            evidence: decision.evidence,
            provider: decision.provider ?? null,
            model: decision.model ?? null,
            idempotencyKey: input.idempotencyKey,
            requestFingerprint: input.requestFingerprint,
          },
        });
        return { ...saved, response: null };
      },
      { timeout: this.sessionTransactionTimeoutMs },
    );
  }

  private async generateAndPersist(input: {
    userId: string;
    sessionId: string;
    detectionId: string;
    idempotencyKey: string;
    requestFingerprint: string;
    context: {
      resumeText: string;
      interviewType: string;
      jobLevel: string;
      jobDescription: string;
      companyName: string;
      companySegment: string | null;
      responsePreference: string;
      aiBehavior: string | null;
    };
    target: { provider: 'gemini' | 'openai' | 'ollama'; model: string };
  }): Promise<GenerateResponseResult> {
    const saved = await this.prisma.$transaction(
      async (tx) => {
        await this.lockGenerationPhase(
          tx,
          'generation',
          input.sessionId,
          input.idempotencyKey,
        );
        const detection = await tx.questionDetection.findFirst({
          where: {
            id: input.detectionId,
            sessionId: input.sessionId,
            idempotencyKey: input.idempotencyKey,
          },
          include: { response: true },
        });
        if (!detection) throw new NotFoundException('Detecção não encontrada.');
        this.assertMatchingFingerprint(
          detection.requestFingerprint,
          input.requestFingerprint,
        );
        if (detection.response || !this.isDetectionApproved(detection)) {
          return detection;
        }
        const locked = await this.lockOwnedSession(
          tx,
          input.userId,
          input.sessionId,
        );
        this.assertActive(locked.status);
        const chunks = await tx.transcriptChunk.findMany({
          where: { sessionId: input.sessionId },
          orderBy: { sequence: 'desc' },
          take: this.maxChunksForGeneration,
        });
        const detectedQuestion = detection.question!;
        const generated = await this.ai.generateSuggestedAnswer({
          context: {
            ...input.context,
            companySegment: input.context.companySegment ?? undefined,
            aiBehavior: input.context.aiBehavior ?? undefined,
          },
          detectedQuestion,
          transcriptWindow: [...chunks]
            .reverse()
            .map(({ content }) => content)
            .join('\n'),
          provider: input.target.provider,
          model: input.target.model,
        });
        const response = await tx.suggestedResponse.create({
          data: {
            sessionId: input.sessionId,
            detectionId: detection.id,
            detectedQuestion,
            suggestedAnswer: generated.suggestedAnswer,
            shortVersion: generated.shortVersion,
            keyPoints: generated.keyPoints,
            strategicNote: generated.strategicNote,
            idempotencyKey: input.idempotencyKey,
            requestFingerprint: input.requestFingerprint,
          },
        });
        return { ...detection, response };
      },
      { timeout: this.sessionTransactionTimeoutMs },
    );
    return this.toGenerationResult(saved);
  }

  private async lockGenerationPhase(
    tx: Prisma.TransactionClient,
    phase: 'detection' | 'generation',
    sessionId: string,
    idempotencyKey: string,
  ): Promise<void> {
    const phaseKey = `${phase}:${sessionId}:${idempotencyKey}`;
    await tx.$queryRaw(Prisma.sql`
      SELECT pg_advisory_xact_lock(hashtextextended(${phaseKey}, 0))::text AS "lock"
    `);
  }

  async endSession(userId: string, sessionId: string) {
    return this.prisma.$transaction(
      async (tx) => {
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
      },
      { timeout: this.sessionTransactionTimeoutMs },
    );
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

  private isDetectionApproved(detection: {
    status: QuestionDetectionStatus;
    question: string | null;
    confidence: number | null;
    source: QuestionDetectionSource;
  }): boolean {
    if (
      detection.status !== QuestionDetectionStatus.DETECTED ||
      !detection.question
    ) {
      return false;
    }
    if (detection.source === QuestionDetectionSource.MANUAL) return true;
    if (detection.source === QuestionDetectionSource.DETERMINISTIC) {
      return (detection.confidence ?? 0) >= 0.85;
    }
    return (
      detection.source === QuestionDetectionSource.LLM &&
      (detection.confidence ?? 0) >= 0.7
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

  private toGenerationResult(detection: {
    id: string;
    status: QuestionDetectionStatus;
    question: string | null;
    confidence: number | null;
    source: QuestionDetectionSource;
    evidence: Prisma.JsonValue;
    detectorVersion: string;
    provider: string | null;
    model: string | null;
    createdAt: Date;
    response: {
      id: string;
      detectedQuestion: string;
      suggestedAnswer: string;
      shortVersion: string;
      keyPoints: string[];
      strategicNote: string;
      createdAt: Date;
    } | null;
  }): GenerateResponseResult {
    const serializedDetection = {
      id: detection.id,
      status: detection.status,
      question: detection.question,
      confidence: detection.confidence,
      source: detection.source,
      evidence: this.parseDetectionEvidence(detection.evidence),
      detectorVersion: detection.detectorVersion,
      provider: detection.provider,
      model: detection.model,
      createdAt: detection.createdAt,
    };
    if (
      detection.status === QuestionDetectionStatus.NOT_FOUND ||
      !detection.response
    ) {
      return {
        status: 'NEEDS_CONFIRMATION',
        detection: serializedDetection,
        answer: null,
      };
    }
    const answer = this.toSuggestedResponse(detection.response);
    return {
      status: 'ANSWER_READY',
      detection: serializedDetection,
      answer,
      ...answer,
    };
  }

  private parseDetectionEvidence(
    evidence: Prisma.JsonValue,
  ): QuestionDetectionEvidence[] {
    if (!Array.isArray(evidence)) return [];
    return evidence.flatMap((item) => {
      if (
        typeof item !== 'object' ||
        item === null ||
        Array.isArray(item) ||
        typeof item.chunkId !== 'string' ||
        typeof item.sequence !== 'number' ||
        typeof item.excerpt !== 'string'
      ) {
        return [];
      }
      return [
        {
          chunkId: item.chunkId,
          sequence: item.sequence,
          excerpt: item.excerpt,
        },
      ];
    });
  }
}
