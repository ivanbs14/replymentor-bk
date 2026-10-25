import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { InterviewService } from './interview.service';
import {
  AddTranscriptDto,
  CreateInterviewContextDto,
  GenerateResponseDto,
  SessionParamsDto,
  StartSessionDto,
} from './dto/interview.dto';
import { assertIdempotencyKey } from './idempotency';

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
    @Param() params: SessionParamsDto,
    @Body() payload: AddTranscriptDto,
    @Headers('idempotency-key') rawIdempotencyKey: string | undefined,
  ) {
    return this.interviewService.addTranscript(
      request.user.userId,
      params.sessionId,
      payload,
      assertIdempotencyKey(rawIdempotencyKey),
    );
  }

  @Post('sessions/:sessionId/generate-response')
  generateResponse(
    @Req() request: AuthenticatedRequest,
    @Param() params: SessionParamsDto,
    @Body() payload: GenerateResponseDto,
    @Headers('idempotency-key') rawIdempotencyKey: string | undefined,
  ) {
    return this.interviewService.generateResponse(
      request.user.userId,
      params.sessionId,
      payload,
      assertIdempotencyKey(rawIdempotencyKey),
    );
  }

  @Post('sessions/:sessionId/end')
  endSession(
    @Req() request: AuthenticatedRequest,
    @Param() params: SessionParamsDto,
  ) {
    return this.interviewService.endSession(
      request.user.userId,
      params.sessionId,
    );
  }

  @Get('sessions/:sessionId/summary')
  getSummary(
    @Req() request: AuthenticatedRequest,
    @Param() params: SessionParamsDto,
  ) {
    return this.interviewService.getSummary(
      request.user.userId,
      params.sessionId,
    );
  }

  @Post('sessions/:sessionId/summary/retry')
  retrySummary(
    @Req() request: AuthenticatedRequest,
    @Param() params: SessionParamsDto,
  ) {
    return this.interviewService.retrySummary(
      request.user.userId,
      params.sessionId,
    );
  }
}
