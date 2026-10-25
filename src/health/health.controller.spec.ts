import { HttpException } from '@nestjs/common';
import type { PrismaService } from '../prisma.service';
import { OperationalLogger } from '../observability/operational-logger';
import { HealthController } from './health.controller';

describe('HealthController', () => {
  const info = jest.fn();
  const errorLog = jest.fn();
  const logger = {
    info,
    error: errorLog,
  } as unknown as OperationalLogger;

  beforeEach(() => jest.clearAllMocks());

  it('reports liveness without consulting dependencies', () => {
    const query = jest.fn();
    const prisma = { $queryRaw: query } as unknown as PrismaService;
    expect(new HealthController(prisma, logger).live()).toEqual({
      status: 'ok',
    });
    expect(query).not.toHaveBeenCalled();
  });

  it('reports readiness when PostgreSQL responds', async () => {
    const prisma = {
      $queryRaw: jest.fn().mockResolvedValue([{ '?column?': 1 }]),
    } as unknown as PrismaService;
    await expect(new HealthController(prisma, logger).ready()).resolves.toEqual(
      {
        status: 'ok',
      },
    );
    expect(info).toHaveBeenCalledWith(
      expect.objectContaining({ event: 'health_ready', outcome: 'success' }),
    );
  });

  it('returns a sanitized 503 when PostgreSQL is unavailable', async () => {
    const prisma = {
      $queryRaw: jest.fn().mockRejectedValue(new Error('private db detail')),
    } as unknown as PrismaService;
    const error = await new HealthController(prisma, logger)
      .ready()
      .catch((caught: unknown) => caught);
    expect(error).toBeInstanceOf(HttpException);
    expect((error as HttpException).getStatus()).toBe(503);
    expect((error as HttpException).getResponse()).toEqual({
      code: 'NOT_READY',
      message: 'Serviço temporariamente indisponível.',
    });
    expect(JSON.stringify(errorLog.mock.calls)).not.toContain('private');
  });

  it('times readiness out when PostgreSQL does not answer', async () => {
    jest.useFakeTimers();
    try {
      const prisma = {
        $queryRaw: jest.fn().mockReturnValue(new Promise(() => undefined)),
      } as unknown as PrismaService;
      const readiness = new HealthController(prisma, logger).ready();
      const assertion = expect(readiness).rejects.toMatchObject({
        status: 503,
      });
      await jest.advanceTimersByTimeAsync(1_001);
      await assertion;
      expect(errorLog).toHaveBeenCalledWith(
        expect.objectContaining({
          event: 'health_ready',
          outcome: 'unavailable',
        }),
      );
    } finally {
      jest.useRealTimers();
    }
  });
});
