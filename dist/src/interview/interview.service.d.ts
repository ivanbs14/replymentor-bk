import { PrismaService } from '../prisma.service';
import { AiService } from '../ai/ai.service';
import type { AddTranscriptDto, CreateInterviewContextDto, GenerateResponseDto, StartSessionDto } from './interview.types';
export declare class InterviewService {
    private readonly prisma;
    private readonly ai;
    private readonly maxChunksForGeneration;
    constructor(prisma: PrismaService, ai: AiService);
    createContext(userId: string, payload: CreateInterviewContextDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        resumeText: string;
        interviewType: string;
        jobLevel: string;
        jobDescription: string;
        companyName: string;
        companySegment: string | null;
        responsePreference: string;
        aiBehavior: string | null;
        userId: string;
    }>;
    getLatestContext(userId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        resumeText: string;
        interviewType: string;
        jobLevel: string;
        jobDescription: string;
        companyName: string;
        companySegment: string | null;
        responsePreference: string;
        aiBehavior: string | null;
        userId: string;
    }>;
    listContexts(userId: string): Promise<{
        id: string;
        resumeText: string;
        interviewType: string;
        jobLevel: string;
        jobDescription: string;
        companyName: string;
        companySegment: string | null;
        responsePreference: string;
        aiBehavior: string | null;
        createdAt: Date;
        updatedAt: Date;
        sessionsCount: number;
        latestSessionAt: Date;
        latestSessionStatus: import(".prisma/client").$Enums.SessionStatus;
    }[]>;
    startSession(userId: string, payload: StartSessionDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.SessionStatus;
        startedAt: Date;
        endedAt: Date | null;
        contextId: string;
    }>;
    addTranscript(userId: string, sessionId: string, payload: AddTranscriptDto): Promise<{
        id: string;
        createdAt: Date;
        sessionId: string;
        sequence: number;
        content: string;
        source: string;
    }>;
    generateResponse(userId: string, sessionId: string, payload: GenerateResponseDto): Promise<{
        id: string;
        detectedQuestion: string;
        suggestedAnswer: string;
        shortVersion: string;
        keyPoints: string[];
        strategicNote: string;
        createdAt: Date;
    }>;
    endSession(userId: string, sessionId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        sessionId: string;
        content: string;
        topics: string[];
    }>;
    getSummary(userId: string, sessionId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        sessionId: string;
        content: string;
        topics: string[];
    }>;
    private detectLatestQuestion;
}
