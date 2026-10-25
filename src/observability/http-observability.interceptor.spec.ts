import type { CallHandler, ExecutionContext } from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { HttpObservabilityInterceptor } from './http-observability.interceptor';
import { OperationalLogger } from './operational-logger';

describe('HttpObservabilityInterceptor', () => {
  const emit = jest.fn();
  const logger = { emit } as unknown as OperationalLogger;

  function context(statusCode: number): ExecutionContext {
    return {
      switchToHttp: () => ({
        getRequest: () => ({
          method: 'GET',
          baseUrl: '/interview',
          route: { path: '/sessions/:sessionId/summary' },
          originalUrl: '/interview/sessions/private-id/summary?secret=value',
        }),
        getResponse: () => ({ statusCode }),
      }),
    } as unknown as ExecutionContext;
  }

  beforeEach(() => emit.mockReset());

  it.each([
    [200, 'info', 'success'],
    [404, 'info', 'rejected'],
  ])('logs normalized HTTP %s completion', (statusCode, level, outcome) => {
    const next = { handle: () => of({}) } as CallHandler;
    new HttpObservabilityInterceptor(logger)
      .intercept(context(statusCode), next)
      .subscribe();
    expect(emit).toHaveBeenCalledWith(
      level,
      expect.objectContaining({
        event: 'api_request',
        outcome,
        method: 'GET',
        route: '/interview/sessions/:sessionId/summary',
        statusCode,
      }),
    );
    expect(JSON.stringify(emit.mock.calls)).not.toContain('private-id');
    expect(JSON.stringify(emit.mock.calls)).not.toContain('secret');
  });

  it('logs a 5xx when the handler fails', () => {
    const next = {
      handle: () => throwError(() => new Error('private failure')),
    } as CallHandler;
    new HttpObservabilityInterceptor(logger)
      .intercept(context(500), next)
      .subscribe({ error: () => undefined });
    expect(emit).toHaveBeenCalledWith(
      'error',
      expect.objectContaining({
        event: 'api_request',
        outcome: 'error',
        statusCode: 500,
      }),
    );
    expect(JSON.stringify(emit.mock.calls)).not.toContain('private failure');
  });
});
