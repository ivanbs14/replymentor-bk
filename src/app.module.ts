import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';
import { AiService } from './ai/ai.service';
import { InterviewController } from './interview/interview.controller';
import { InterviewService } from './interview/interview.service';

@Module({
  imports: [],
  controllers: [AppController, InterviewController],
  providers: [AppService, PrismaService, AiService, InterviewService],
})
export class AppModule {}
