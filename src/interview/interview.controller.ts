import { Body, Controller, Get, Param, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import { InterviewService } from './interview.service';
import type {
  AddTranscriptDto,
  CreateInterviewContextDto,
  GenerateResponseDto,
  StartSessionDto,
} from './interview.types';

type AuthenticatedRequest = Request & {
  user: { userId: string; email: string };
};

@Controller('interview')
export class InterviewController {
  constructor(private readonly interviewService: InterviewService) {}

  @Post('context')
  createContext(
    @Req() request: AuthenticatedRequest,
    @Body() payload: CreateInterviewContextDto,
  ) {
    return this.interviewService.createContext(request.user.userId, payload);
  }

  @Get('context/latest')
  getLatestContext(@Req() request: AuthenticatedRequest) {
    return this.interviewService.getLatestContext(request.user.userId);
  }

  @Get('contexts')
  listContexts(@Req() request: AuthenticatedRequest) {
    return this.interviewService.listContexts(request.user.userId);
  }

  @Post('sessions/start')
  startSession(
    @Req() request: AuthenticatedRequest,
    @Body() payload: StartSessionDto,
  ) {
    return this.interviewService.startSession(request.user.userId, payload);
  }

  @Post('sessions/:sessionId/transcripts')
  addTranscript(
    @Req() request: AuthenticatedRequest,
    @Param('sessionId') sessionId: string,
    @Body() payload: AddTranscriptDto,
  ) {
    return this.interviewService.addTranscript(
      request.user.userId,
      sessionId,
      payload,
    );
  }

  @Post('sessions/:sessionId/generate-response')
  generateResponse(
    @Req() request: AuthenticatedRequest,
    @Param('sessionId') sessionId: string,
    @Body() payload: GenerateResponseDto,
  ) {
    return this.interviewService.generateResponse(
      request.user.userId,
      sessionId,
      payload,
    );
  }

  @Post('sessions/:sessionId/end')
  endSession(
    @Req() request: AuthenticatedRequest,
    @Param('sessionId') sessionId: string,
  ) {
    return this.interviewService.endSession(request.user.userId, sessionId);
  }

  @Get('sessions/:sessionId/summary')
  getSummary(
    @Req() request: AuthenticatedRequest,
    @Param('sessionId') sessionId: string,
  ) {
    return this.interviewService.getSummary(request.user.userId, sessionId);
  }
}
