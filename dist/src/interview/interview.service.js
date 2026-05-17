"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InterviewService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma.service");
const ai_service_1 = require("../ai/ai.service");
let InterviewService = class InterviewService {
    prisma;
    ai;
    maxChunksForGeneration = 8;
    constructor(prisma, ai) {
        this.prisma = prisma;
        this.ai = ai;
    }
    async createContext(payload) {
        return this.prisma.interviewContext.create({ data: payload });
    }
    async getLatestContext() {
        const context = await this.prisma.interviewContext.findFirst({
            orderBy: { createdAt: 'desc' },
        });
        if (!context) {
            throw new common_1.NotFoundException('Nenhum contexto de entrevista encontrado.');
        }
        return context;
    }
    async startSession(payload) {
        const context = await this.prisma.interviewContext.findUnique({
            where: { id: payload.contextId },
        });
        if (!context) {
            throw new common_1.NotFoundException('Contexto de entrevista não encontrado.');
        }
        return this.prisma.interviewSession.create({
            data: { contextId: payload.contextId, status: client_1.SessionStatus.ACTIVE },
        });
    }
    async addTranscript(sessionId, payload) {
        const session = await this.prisma.interviewSession.findUnique({
            where: { id: sessionId },
        });
        if (!session) {
            throw new common_1.NotFoundException('Sessão não encontrada.');
        }
        if (session.status !== client_1.SessionStatus.ACTIVE) {
            throw new common_1.BadRequestException('Sessão já encerrada.');
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
    async generateResponse(sessionId, payload) {
        const session = await this.prisma.interviewSession.findUnique({
            where: { id: sessionId },
            include: { context: true },
        });
        if (!session) {
            throw new common_1.NotFoundException('Sessão não encontrada.');
        }
        const latestChunks = await this.prisma.transcriptChunk.findMany({
            where: { sessionId },
            orderBy: { sequence: 'desc' },
            take: this.maxChunksForGeneration,
        });
        if (latestChunks.length === 0) {
            throw new common_1.BadRequestException('Não há transcrição para gerar resposta.');
        }
        const chunks = latestChunks.reverse();
        const transcriptWindow = chunks.map((item) => item.content).join('\n');
        const detectedQuestion = payload.forceQuestion?.trim() ??
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
    async endSession(sessionId) {
        const session = await this.prisma.interviewSession.findUnique({
            where: { id: sessionId },
        });
        if (!session) {
            throw new common_1.NotFoundException('Sessão não encontrada.');
        }
        const responses = await this.prisma.suggestedResponse.findMany({
            where: { sessionId },
            orderBy: { createdAt: 'asc' },
        });
        const content = responses.length === 0
            ? 'Sessão encerrada sem respostas sugeridas registradas.'
            : `Sessão encerrada com ${responses.length} respostas sugeridas.`;
        const topics = responses.map((r) => r.detectedQuestion).slice(-10);
        await this.prisma.interviewSession.update({
            where: { id: sessionId },
            data: { status: client_1.SessionStatus.CLOSED, endedAt: new Date() },
        });
        return this.prisma.sessionSummary.upsert({
            where: { sessionId },
            update: { content, topics },
            create: { sessionId, content, topics },
        });
    }
    async getSummary(sessionId) {
        const summary = await this.prisma.sessionSummary.findUnique({
            where: { sessionId },
        });
        if (!summary) {
            throw new common_1.NotFoundException('Resumo da sessão não encontrado.');
        }
        return summary;
    }
    detectLatestQuestion(transcriptWindow) {
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
};
exports.InterviewService = InterviewService;
exports.InterviewService = InterviewService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        ai_service_1.AiService])
], InterviewService);
//# sourceMappingURL=interview.service.js.map