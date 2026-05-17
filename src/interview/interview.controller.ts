import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { InterviewService } from './interview.service';
import type {
  AddTranscriptDto,
  CreateInterviewContextDto,
  GenerateResponseDto,
  StartSessionDto,
} from './interview.types';

@Controller('interview')
export class InterviewController {
  constructor(private readonly interviewService: InterviewService) {}

  @Post('context')
  createContext(@Body() payload: CreateInterviewContextDto) {
    return this.interviewService.createContext(payload);
  }

  @Get('context/latest')
  getLatestContext() {
    return this.interviewService.getLatestContext();
  }

  @Post('sessions/start')
  startSession(@Body() payload: StartSessionDto) {
    return this.interviewService.startSession(payload);
  }

  @Post('sessions/:sessionId/transcripts')
  addTranscript(
    @Param('sessionId') sessionId: string,
    @Body() payload: AddTranscriptDto,
  ) {
    return this.interviewService.addTranscript(sessionId, payload);
  }

  @Post('sessions/:sessionId/generate-response')
  generateResponse(
    @Param('sessionId') sessionId: string,
    @Body() payload: GenerateResponseDto,
  ) {
    return this.interviewService.generateResponse(sessionId, payload);
  }

  @Post('sessions/:sessionId/end')
  endSession(@Param('sessionId') sessionId: string) {
    return this.interviewService.endSession(sessionId);
  }

  @Get('sessions/:sessionId/summary')
  getSummary(@Param('sessionId') sessionId: string) {
    return this.interviewService.getSummary(sessionId);
  }
}
