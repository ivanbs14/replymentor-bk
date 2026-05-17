import type { Request } from 'express';
import { InterviewService } from './interview.service';
import type { AddTranscriptDto, CreateInterviewContextDto, GenerateResponseDto, StartSessionDto } from './interview.types';
type AuthenticatedRequest = Request & {
    user: {
        userId: string;
        email: string;
    };
};
export declare class InterviewController {
    private readonly interviewService;
    constructor(interviewService: InterviewService);
    createContext(request: AuthenticatedRequest, payload: CreateInterviewContextDto): Promise<{
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
    getLatestContext(request: AuthenticatedRequest): Promise<{
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
    listContexts(request: AuthenticatedRequest): Promise<{
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
    startSession(request: AuthenticatedRequest, payload: StartSessionDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.SessionStatus;
        startedAt: Date;
        endedAt: Date | null;
        contextId: string;
    }>;
    addTranscript(request: AuthenticatedRequest, sessionId: string, payload: AddTranscriptDto): Promise<{
        id: string;
        createdAt: Date;
        sessionId: string;
        sequence: number;
        content: string;
        source: string;
    }>;
    generateResponse(request: AuthenticatedRequest, sessionId: string, payload: GenerateResponseDto): Promise<{
        id: string;
        detectedQuestion: string;
        suggestedAnswer: string;
        shortVersion: string;
        keyPoints: string[];
        strategicNote: string;
        createdAt: Date;
    }>;
    endSession(request: AuthenticatedRequest, sessionId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        sessionId: string;
        content: string;
        topics: string[];
    }>;
    getSummary(request: AuthenticatedRequest, sessionId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        sessionId: string;
        content: string;
        topics: string[];
    }>;
}
export {};
