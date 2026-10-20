import { NotFoundException } from '@nestjs/common';
import type { PrismaService } from '../prisma.service';
import type { AiService } from '../ai/ai.service';
import { InterviewService } from './interview.service';

describe('InterviewService isolation', () => {
  it('does not start a session from another user context', async () => {
    const prisma = {
      interviewContext: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'context-user-a',
          userId: 'user-a',
        }),
      },
      interviewSession: {
        create: jest.fn(),
      },
    };
    const service = new InterviewService(
      prisma as unknown as PrismaService,
      {} as AiService,
    );

    await expect(
      service.startSession('user-b', { contextId: 'context-user-a' }),
    ).rejects.toThrow(NotFoundException);
    expect(prisma.interviewSession.create).not.toHaveBeenCalled();
  });
});
