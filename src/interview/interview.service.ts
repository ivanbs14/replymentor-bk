import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { SessionStatus } from '@prisma/client';
import { PrismaService } from '../prisma.service';
import { AiService } from '../ai/ai.service';
import type {
  AddTranscriptDto,
  CreateInterviewContextDto,
  GenerateResponseDto,
  StartSessionDto,
} from './interview.types';

@Injectable()
export class InterviewService {
  private readonly maxChunksForGeneration = 8;

  constructor(
    private readonly prisma: PrismaService,
    private readonly ai: AiService,
  ) {}

  async createContext(payload: CreateInterviewContextDto) {
    return this.prisma.interviewContext.create({ data: payload });
  }

  async getLatestContext() {
    const context = await this.prisma.interviewContext.findFirst({
      orderBy: { createdAt: 'desc' },
    });
    if (!context) {
      throw new NotFoundException('Nenhum contexto de entrevista encontrado.');
    }
    return context;
  }

  async startSession(payload: StartSessionDto) {
    const context = await this.prisma.interviewContext.findUnique({
      where: { id: payload.contextId },
    });
    if (!context) {
      throw new NotFoundException('Contexto de entrevista não encontrado.');
    }

    return this.prisma.interviewSession.create({
      data: { contextId: payload.contextId, status: SessionStatus.ACTIVE },
    });
  }

  async addTranscript(sessionId: string, payload: AddTranscriptDto) {
    const session = await this.prisma.interviewSession.findUnique({
      where: { id: sessionId },
    });
    if (!session) {
      throw new NotFoundException('Sessão não encontrada.');
    }
    if (session.status !== SessionStatus.ACTIVE) {
      throw new BadRequestException('Sessão já encerrada.');
    }

    const transcript = await this.ai.transcribeLiveChunk({
      transcript: payload.transcript,
      audioBase64: payload.audioBase64,
      mimeType: payload.mimeType,
    });

    const count = await this.prisma.transcriptChunk.count({ where: { sessionId } });
    return this.prisma.transcriptChunk.create({
      data: {
        sessionId,
        sequence: count + 1,
        content: transcript,
        source: payload.transcript ? 'manual' : 'stt',
      },
    });
  }

  async generateResponse(sessionId: string, payload: GenerateResponseDto) {
    const session = await this.prisma.interviewSession.findUnique({
      where: { id: sessionId },
      include: { context: true },
    });
    if (!session) {
      throw new NotFoundException('Sessão não encontrada.');
    }

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
      provider: payload.provider,
      model: payload.model,
    });

    const saved = await this.prisma.suggestedResponse.create({
      data: {
        sessionId,
        detectedQuestion: generated.detectedQuestion,
        suggestedAnswer: generated.suggestedAnswer,
        shortVersion: generated.shortVersion,
        keyPoints: generated.keyPoints,
        strategicNote: generated.strategicNote,
      },
    });

    return {
      id: saved.id,
      detectedQuestion: saved.detectedQuestion,
      suggestedAnswer: saved.suggestedAnswer,
      shortVersion: saved.shortVersion,
      keyPoints: saved.keyPoints,
      strategicNote: saved.strategicNote,
      createdAt: saved.createdAt,
    };
  }

  async endSession(sessionId: string) {
    const session = await this.prisma.interviewSession.findUnique({
      where: { id: sessionId },
    });
    if (!session) {
      throw new NotFoundException('Sessão não encontrada.');
    }

    const responses = await this.prisma.suggestedResponse.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'asc' },
    });

    const content =
      responses.length === 0
        ? 'Sessão encerrada sem respostas sugeridas registradas.'
        : `Sessão encerrada com ${responses.length} respostas sugeridas.`;

    const topics = responses.map((r) => r.detectedQuestion).slice(-10);

    await this.prisma.interviewSession.update({
      where: { id: sessionId },
      data: { status: SessionStatus.CLOSED, endedAt: new Date() },
    });

    return this.prisma.sessionSummary.upsert({
      where: { sessionId },
      update: { content, topics },
      create: { sessionId, content, topics },
    });
  }

  async getSummary(sessionId: string) {
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
}
