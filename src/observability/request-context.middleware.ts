import { Injectable, type NestMiddleware } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';
import { runWithRequestContext } from './request-context';

export const REQUEST_ID_HEADER = 'X-Request-ID';
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function resolveRequestId(value: unknown): string {
  return typeof value === 'string' && UUID_PATTERN.test(value)
    ? value.toLowerCase()
    : randomUUID();
}

@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
  use(request: Request, response: Response, next: NextFunction): void {
    const correlationId = resolveRequestId(request.header(REQUEST_ID_HEADER));
    response.setHeader(REQUEST_ID_HEADER, correlationId);
    runWithRequestContext({ correlationId }, next);
  }
}
