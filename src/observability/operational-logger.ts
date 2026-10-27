import { Injectable, type LoggerService } from '@nestjs/common';
import { getCorrelationId } from './request-context';

export type OperationalLevel = 'debug' | 'info' | 'warn' | 'error';

export type OperationalEvent = {
  event: string;
  outcome?: string;
  durationMs?: number;
  statusCode?: number;
  route?: string;
  method?: string;
  sessionId?: string;
  provider?: string;
  model?: string;
  errorCode?: string;
  detectorVersion?: string;
  policyGroup?: string;
  retryBucket?: string;
  count?: number;
  size?: number;
  [key: string]: unknown;
};

const EVENT_FIELDS = new Set([
  'event',
  'outcome',
  'durationMs',
  'statusCode',
  'route',
  'method',
  'sessionId',
  'provider',
  'model',
  'errorCode',
  'detectorVersion',
  'policyGroup',
  'retryBucket',
  'count',
  'size',
]);

export function sanitizeOperationalEvent(
  level: OperationalLevel,
  input: OperationalEvent,
  now = new Date(),
): Record<string, unknown> {
  const output: Record<string, unknown> = {
    timestamp: now.toISOString(),
    level,
    service: 'replymentor-backend',
    environment: process.env.NODE_ENV ?? 'development',
  };
  const correlationId = getCorrelationId();
  if (correlationId) output.correlationId = correlationId;
  for (const [key, value] of Object.entries(input)) {
    if (!EVENT_FIELDS.has(key) || value === undefined || value === null)
      continue;
    if (key === 'durationMs' && typeof value === 'number') {
      output[key] = Math.max(0, Math.round(value));
      continue;
    }
    if (
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean'
    ) {
      output[key] = value;
    }
  }
  return output;
}

@Injectable()
export class OperationalLogger implements LoggerService {
  emit(level: OperationalLevel, event: OperationalEvent): void {
    try {
      process.stdout.write(
        `${JSON.stringify(sanitizeOperationalEvent(level, event))}\n`,
      );
    } catch {
      // Observability must never change the functional response.
    }
  }

  info(event: OperationalEvent): void {
    this.emit('info', event);
  }

  log(message: unknown): void {
    this.emit('info', this.asEvent(message, 'log'));
  }

  warn(message: unknown): void {
    this.emit('warn', this.asEvent(message, 'warn'));
  }

  error(message: unknown): void {
    this.emit('error', this.asEvent(message, 'error'));
  }

  debug(message: unknown): void {
    this.emit('debug', this.asEvent(message, 'debug'));
  }

  fatal(message: unknown): void {
    this.emit('error', this.asEvent(message, 'fatal'));
  }

  private asEvent(message: unknown, outcome: string): OperationalEvent {
    if (
      typeof message === 'object' &&
      message !== null &&
      typeof (message as Record<string, unknown>).event === 'string'
    ) {
      return message as OperationalEvent;
    }
    return { event: 'framework_log', outcome };
  }
}
