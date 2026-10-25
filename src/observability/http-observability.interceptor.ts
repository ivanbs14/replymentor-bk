import {
  HttpException,
  Injectable,
  type CallHandler,
  type ExecutionContext,
  type NestInterceptor,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import type { Observable } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { OperationalLogger } from './operational-logger';

function normalizedRoute(request: Request): string {
  const route: unknown = request.route;
  const routePath =
    typeof route === 'object' && route !== null
      ? (route as Record<string, unknown>).path
      : undefined;
  if (typeof routePath !== 'string') return 'unmatched';
  return `${request.baseUrl ?? ''}${routePath}` || '/';
}

@Injectable()
export class HttpObservabilityInterceptor implements NestInterceptor {
  constructor(private readonly logger: OperationalLogger) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp();
    const request = http.getRequest<Request>();
    const response = http.getResponse<Response>();
    const started = performance.now();
    let failureStatus: number | undefined;
    return next.handle().pipe(
      catchError((error: unknown) => {
        const errorRecord =
          typeof error === 'object' && error !== null
            ? (error as Record<string, unknown>)
            : undefined;
        const reflected = errorRecord?.status ?? errorRecord?.statusCode;
        failureStatus =
          error instanceof HttpException
            ? error.getStatus()
            : typeof reflected === 'number'
              ? reflected
              : 500;
        return throwError(() => error);
      }),
      finalize(() => {
        const statusCode = failureStatus ?? response.statusCode;
        this.logger.emit(statusCode >= 500 ? 'error' : 'info', {
          event: 'api_request',
          outcome:
            statusCode >= 500
              ? 'error'
              : statusCode >= 400
                ? 'rejected'
                : 'success',
          method: request.method,
          route: normalizedRoute(request),
          statusCode,
          durationMs: performance.now() - started,
        });
      }),
    );
  }
}
