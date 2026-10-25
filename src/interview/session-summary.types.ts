import type { LlmProvider } from './interview.types';

export const SESSION_SUMMARY_PROMPT_VERSION = 'session-summary-v1';

export type SessionSummaryEvidence = {
  text: string;
  evidenceResponseId: string;
};

export type SessionSummaryContent = {
  overview: string;
  questions: Array<{ question: string; answerSummary: string }>;
  topics: string[];
  strengths: SessionSummaryEvidence[];
  improvements: SessionSummaryEvidence[];
  nextSteps: string[];
};

export type SessionSummaryContext = {
  professionalContext: {
    resumeText: string;
    interviewType: string;
    jobLevel: string;
    jobDescription: string;
    companyName: string;
    companySegment: string;
  };
  responses: Array<{
    responseId: string;
    question: string;
    answer: string;
  }>;
};

export type SessionSummaryTarget = {
  provider: LlmProvider;
  model: string;
};
