import 'dotenv/config';
import { MiddlewareConsumer, Module, type NestModule } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
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
import { SessionSummaryProcessor } from './interview/session-summary.processor';
import { HealthController } from './health/health.controller';
import { OperationalLogger } from './observability/operational-logger';
import { RequestContextMiddleware } from './observability/request-context.middleware';
import { HttpObservabilityInterceptor } from './observability/http-observability.interceptor';

@Module({
  imports: [JwtModule.register({})],
  controllers: [
    AppController,
    InterviewController,
    AuthController,
    HealthController,
  ],
  providers: [
    AppService,
    PrismaService,
    AiService,
    QuestionDetectionConfig,
    GeminiQuestionDetector,
    OperationalLogger,
    RequestContextMiddleware,
    {
      provide: HybridQuestionDetector,
      useFactory: (
        detector: GeminiQuestionDetector,
        config: QuestionDetectionConfig,
        logger: OperationalLogger,
      ) => {
        return new HybridQuestionDetector(
          detector,
          config,
          (outcome) =>
            logger.info({
              event: 'question_detection_provider',
              provider: 'gemini',
              model: config.model,
              outcome,
            }),
          (outcome, durationMs) =>
            logger.info({
              event: 'question_detection',
              detectorVersion: 'hybrid-v1',
              outcome,
              durationMs,
            }),
        );
      },
      inject: [
        GeminiQuestionDetector,
        QuestionDetectionConfig,
        OperationalLogger,
      ],
    },
    InterviewService,
    SessionSummaryProcessor,
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
    {
      provide: APP_INTERCEPTOR,
      useClass: HttpObservabilityInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestContextMiddleware).forRoutes('*');
  }
}
