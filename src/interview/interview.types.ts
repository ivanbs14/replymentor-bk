export type { CreateInterviewContextDto } from './dto/interview.dto';
export type { LlmProvider } from '../common/api-contract';

export type SuggestedAnswerPayload = {
  detectedQuestion: string;
  suggestedAnswer: string;
  shortVersion: string;
  keyPoints: string[];
  strategicNote: string;
};
