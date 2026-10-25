import { Controller, Get, HttpException, HttpStatus } from '@nestjs/common';
import { Public } from '../auth/public.decorator';
import { PrismaService } from '../prisma.service';
import { OperationalLogger } from '../observability/operational-logger';

const READY_TIMEOUT_MS = 1_000;

@Controller('health')
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: OperationalLogger,
  ) {}

  @Public()
  @Get('live')
  live() {
    return { status: 'ok' };
  }

  @Public()
  @Get('ready')
  async ready() {
    const started = performance.now();
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      await Promise.race([
        this.prisma.$queryRaw`SELECT 1`,
        new Promise<never>((_resolve, reject) => {
          timer = setTimeout(
            () => reject(new Error('readiness_timeout')),
            READY_TIMEOUT_MS,
          );
        }),
      ]);
      this.logger.info({
        event: 'health_ready',
        outcome: 'success',
        durationMs: performance.now() - started,
      });
      return { status: 'ok' };
    } catch {
      this.logger.error({
        event: 'health_ready',
        outcome: 'unavailable',
        errorCode: 'DATABASE_UNAVAILABLE',
        durationMs: performance.now() - started,
      });
      throw new HttpException(
        {
          code: 'NOT_READY',
          message: 'Serviço temporariamente indisponível.',
        },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    } finally {
      clearTimeout(timer);
    }
  }
}
