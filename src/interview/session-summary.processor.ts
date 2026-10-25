import {
  Injectable,
  Optional,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { Prisma, SessionSummaryStatus } from '@prisma/client';
import { AiService } from '../ai/ai.service';
import { PrismaService } from '../prisma.service';
import {
  buildSessionSummaryContext,
  emptySessionSummary,
  parseSessionSummaryContent,
} from './session-summary';
import type { LlmProvider } from './interview.types';
import { OperationalLogger } from '../observability/operational-logger';

type ClaimedSummary = { id: string };

@Injectable()
export class SessionSummaryProcessor implements OnModuleInit, OnModuleDestroy {
  private timer: NodeJS.Timeout | null = null;
  private running = false;

  constructor(
    private readonly prisma: PrismaService,
    private readonly ai: AiService,
    @Optional() private readonly logger = new OperationalLogger(),
  ) {}

  onModuleInit(): void {
    if (process.env.SESSION_SUMMARY_PROCESSOR_ENABLED === 'false') return;
    const interval = Math.max(
      Number(process.env.SESSION_SUMMARY_POLL_MS ?? '1000') || 1_000,
      250,
    );
    this.timer = setInterval(() => void this.drainOnce(), interval);
    this.timer.unref();
    void this.drainOnce();
  }

  onModuleDestroy(): void {
    if (this.timer) clearInterval(this.timer);
  }

  async drainOnce(): Promise<boolean> {
    if (this.running) return false;
    this.running = true;
    try {
      const claimed = await this.claimNext();
      if (!claimed) return false;
      await this.process(claimed.id);
      return true;
    } finally {
      this.running = false;
    }
  }

  private async claimNext(): Promise<ClaimedSummary | null> {
    return this.prisma.$transaction(async (tx) => {
      await tx.sessionSummary.updateMany({
        where: {
          status: SessionSummaryStatus.PROCESSING,
          claimedAt: { lt: new Date(Date.now() - 120_000) },
          providerCallStartedAt: { not: null },
        },
        data: {
          status: SessionSummaryStatus.FAILED,
          completedAt: new Date(),
          errorCode: 'WORKER_INTERRUPTED',
        },
      });
      const rows = await tx.$queryRaw<ClaimedSummary[]>(Prisma.sql`
        WITH candidate AS (
          SELECT "id"
          FROM "SessionSummary"
          WHERE "status" = 'PENDING'
             OR (
               "status" = 'PROCESSING'
               AND "claimedAt" < NOW() - INTERVAL '2 minutes'
               AND "providerCallStartedAt" IS NULL
             )
          ORDER BY "createdAt" ASC
          FOR UPDATE SKIP LOCKED
          LIMIT 1
        )
        UPDATE "SessionSummary" AS summary
        SET "status" = 'PROCESSING',
            "claimedAt" = NOW(),
            "startedAt" = COALESCE(summary."startedAt", NOW()),
            "attemptCount" = summary."attemptCount" + 1,
            "updatedAt" = NOW()
        FROM candidate
        WHERE summary."id" = candidate."id"
        RETURNING summary."id"
      `);
      return rows[0] ?? null;
    });
  }

  private async process(summaryId: string): Promise<void> {
    const started = performance.now();
    const summary = await this.prisma.sessionSummary.findUnique({
      where: { id: summaryId },
      include: {
        session: {
          include: {
            context: true,
            suggestedResponse: {
              orderBy: { createdAt: 'asc' },
              include: { detection: true },
            },
          },
        },
      },
    });
    if (!summary || summary.status !== SessionSummaryStatus.PROCESSING) return;
    const responses = summary.session.suggestedResponse;
    if (responses.length === 0) {
      await this.markReady(summaryId, emptySessionSummary(), []);
      this.logger.info({
        event: 'session_summary',
        sessionId: summary.sessionId,
        outcome: 'empty',
        durationMs: performance.now() - started,
      });
      return;
    }

    const latestTarget = [...responses]
      .reverse()
      .find(
        (response) => response.detection.provider && response.detection.model,
      );
    let target: { provider: LlmProvider; model: string };
    try {
      target = this.ai.resolveGenerationTarget(
        latestTarget?.detection.provider as LlmProvider | undefined,
        latestTarget?.detection.model ?? undefined,
      );
    } catch {
      target = this.ai.resolveGenerationTarget();
    }
    const context = buildSessionSummaryContext(
      summary.session.context,
      responses,
    );
    await this.prisma.sessionSummary.update({
      where: { id: summaryId, status: SessionSummaryStatus.PROCESSING },
      data: {
        provider: target.provider,
        model: target.model,
        providerCallStartedAt: new Date(),
      },
    });

    try {
      const raw = await this.ai.generateSessionSummary({ context, target });
      const content = parseSessionSummaryContent(
        raw,
        new Set(responses.map((response) => response.id)),
      );
      if (!content) {
        await this.markFailed(summaryId, 'INVALID_PROVIDER_RESPONSE');
        this.logger.warn({
          event: 'session_summary',
          sessionId: summary.sessionId,
          provider: target.provider,
          model: target.model,
          outcome: 'invalid_contract',
          errorCode: 'INVALID_PROVIDER_RESPONSE',
          durationMs: performance.now() - started,
        });
        return;
      }
      await this.markReady(summaryId, content, [
        ...new Set(
          [...content.strengths, ...content.improvements].map(
            (item) => item.evidenceResponseId,
          ),
        ),
      ]);
      this.logger.info({
        event: 'session_summary',
        sessionId: summary.sessionId,
        provider: target.provider,
        model: target.model,
        outcome: 'success',
        durationMs: performance.now() - started,
      });
    } catch (error) {
      const name = error instanceof Error ? error.constructor.name : '';
      const code = name.includes('Timeout')
        ? 'PROVIDER_TIMEOUT'
        : name.includes('Unavailable')
          ? 'PROVIDER_UNAVAILABLE'
          : 'PROVIDER_ERROR';
      await this.markFailed(summaryId, code);
      this.logger.warn({
        event: 'session_summary',
        sessionId: summary.sessionId,
        provider: target.provider,
        model: target.model,
        outcome: 'failed',
        errorCode: code,
        durationMs: performance.now() - started,
      });
    }
  }

  private async markReady(
    id: string,
    content: object,
    evidenceResponseIds: string[],
  ) {
    await this.prisma.sessionSummary.update({
      where: { id, status: SessionSummaryStatus.PROCESSING },
      data: {
        status: SessionSummaryStatus.READY,
        content: content,
        evidenceResponseIds,
        completedAt: new Date(),
        errorCode: null,
      },
    });
  }

  private async markFailed(id: string, errorCode: string) {
    await this.prisma.sessionSummary.update({
      where: { id, status: SessionSummaryStatus.PROCESSING },
      data: {
        status: SessionSummaryStatus.FAILED,
        content: Prisma.JsonNull,
        completedAt: new Date(),
        errorCode,
      },
    });
  }
}
