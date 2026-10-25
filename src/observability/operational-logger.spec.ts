import { randomUUID } from 'node:crypto';
import { sanitizeOperationalEvent } from './operational-logger';
import { runWithRequestContext } from './request-context';

describe('operational logger allowlist', () => {
  it('keeps only explicitly allowed operational fields', () => {
    const correlationId = randomUUID();
    const logged = runWithRequestContext({ correlationId }, () =>
      sanitizeOperationalEvent('error', {
        event: 'provider_call',
        outcome: 'timeout',
        durationMs: 12.7,
        provider: 'gemini',
        errorCode: 'PROVIDER_TIMEOUT',
        email: 'private@example.test',
        userId: 'private-user',
        transcript: 'private transcript',
        prompt: 'private prompt',
        token: 'private token',
        stack: 'private stack',
        url: '/path?secret=value',
      }),
    );

    expect(logged).toMatchObject({
      level: 'error',
      service: 'replymentor-backend',
      event: 'provider_call',
      outcome: 'timeout',
      durationMs: 13,
      provider: 'gemini',
      errorCode: 'PROVIDER_TIMEOUT',
      correlationId,
    });
    expect(JSON.stringify(logged)).not.toContain('private');
    expect(logged).not.toHaveProperty('userId');
    expect(logged).not.toHaveProperty('stack');
    expect(logged).not.toHaveProperty('url');
  });
});
