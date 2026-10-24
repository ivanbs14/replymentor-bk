import 'dotenv/config';
import { Logger, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';
import { AiService } from './ai/ai.service';
import { InterviewController } from './interview/interview.controller';
import { InterviewService } from './interview/interview.service';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { AuthGuard } from './auth/auth.guard';
import { AuthConfigService } from './auth/auth-config.service';
import { OriginGuard } from './auth/origin.guard';
import { QuestionDetectionConfig } from './interview/question-detection/question-detection.config';
import { GeminiQuestionDetector } from './interview/question-detection/gemini-question-detector';
import { HybridQuestionDetector } from './interview/question-detection/hybrid-question-detector';

@Module({
  imports: [JwtModule.register({})],
  controllers: [AppController, InterviewController, AuthController],
  providers: [
    AppService,
    PrismaService,
    AiService,
    QuestionDetectionConfig,
    GeminiQuestionDetector,
    {
      provide: HybridQuestionDetector,
      useFactory: (
        detector: GeminiQuestionDetector,
        config: QuestionDetectionConfig,
      ) => {
        const logger = new Logger(HybridQuestionDetector.name);
        return new HybridQuestionDetector(
          detector,
          config,
          (outcome) =>
            logger.log({
              provider: 'gemini',
              model: config.model,
              outcome,
            }),
          (outcome, durationMs) =>
            logger.log({
              detectorVersion: 'hybrid-v1',
              outcome,
              durationMs,
            }),
        );
      },
      inject: [GeminiQuestionDetector, QuestionDetectionConfig],
    },
    InterviewService,
    AuthService,
    AuthConfigService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: OriginGuard,
    },
  ],
})
export class AppModule {}
