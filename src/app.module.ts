import 'dotenv/config';
import { Module } from '@nestjs/common';
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

@Module({
  imports: [JwtModule.register({})],
  controllers: [AppController, InterviewController, AuthController],
  providers: [
    AppService,
    PrismaService,
    AiService,
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
