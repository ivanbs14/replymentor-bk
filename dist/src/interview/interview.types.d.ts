export type CreateInterviewContextDto = {
    resumeText: string;
    interviewType: string;
    jobLevel: string;
    jobDescription: string;
    companyName: string;
    companySegment?: string;
    responsePreference: string;
    aiBehavior?: string;
};
export type StartSessionDto = {
    contextId: string;
};
export type AddTranscriptDto = {
    transcript?: string;
    audioBase64?: string;
    mimeType?: string;
};
export type LlmProvider = 'gemini' | 'ollama' | 'openai';
export type GenerateResponseDto = {
    forceQuestion?: string;
    provider?: LlmProvider;
    model?: string;
};
export type SuggestedAnswerPayload = {
    detectedQuestion: string;
    suggestedAnswer: string;
    shortVersion: string;
    keyPoints: string[];
    strategicNote: string;
};
