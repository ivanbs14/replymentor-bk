import { InterviewService } from './interview.service';
import type { AddTranscriptDto, CreateInterviewContextDto, GenerateResponseDto, StartSessionDto } from './interview.types';
export declare class InterviewController {
    private readonly interviewService;
    constructor(interviewService: InterviewService);
    createContext(payload: CreateInterviewContextDto): Promise<{
        id: string;
        resumeText: string;
        interviewType: string;
        jobLevel: string;
        jobDescription: string;
        companyName: string;
        companySegment: string | null;
        responsePreference: string;
        createdAt: Date;
        updatedAt: Date;
        aiBehavior: string | null;
    }>;
    getLatestContext(): Promise<{
        id: string;
        resumeText: string;
        interviewType: string;
        jobLevel: string;
        jobDescription: string;
        companyName: string;
        companySegment: string | null;
        responsePreference: string;
        createdAt: Date;
        updatedAt: Date;
        aiBehavior: string | null;
    }>;
    startSession(payload: StartSessionDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.SessionStatus;
        startedAt: Date;
        endedAt: Date | null;
        contextId: string;
    }>;
    addTranscript(sessionId: string, payload: AddTranscriptDto): Promise<{
        id: string;
        createdAt: Date;
        sessionId: string;
        sequence: number;
        content: string;
        source: string;
    }>;
    generateResponse(sessionId: string, payload: GenerateResponseDto): Promise<{
        id: string;
        detectedQuestion: string;
        suggestedAnswer: string;
        shortVersion: string;
        keyPoints: string[];
        strategicNote: string;
        createdAt: Date;
    }>;
    endSession(sessionId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        sessionId: string;
        content: string;
        topics: string[];
    }>;
    getSummary(sessionId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        sessionId: string;
        content: string;
        topics: string[];
    }>;
}
