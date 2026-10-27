import { RateLimitKeyService } from './rate-limit-key.service';

describe('RateLimitKeyService', () => {
  const service = new RateLimitKeyService('s'.repeat(32), 'test');

  it('never includes raw IP addresses in Redis keys', () => {
    const key = service.forIp(' 203.0.113.9 ');
    expect(key).not.toContain('203.0.113.9');
    expect(key).toMatch(/^replymentor:test:rate-limit:v1:ip:[a-f0-9]{64}$/);
  });

  it('normalizes account identifiers without exposing them', () => {
    const mixed = service.forAccount(' User@Example.COM ');
    expect(mixed).toBe(service.forAccount('user@example.com'));
    expect(mixed).not.toContain('user@example.com');
  });

  it('separates users, sessions and key kinds', () => {
    const user = service.forUser('user-a');
    const sessionA = service.forUserSession('user-a', 'session-a');
    const sessionB = service.forUserSession('user-a', 'session-b');

    expect(new Set([user, sessionA, sessionB])).toHaveProperty('size', 3);
    for (const key of [user, sessionA, sessionB]) {
      expect(key).not.toContain('user-a');
      expect(key).not.toContain('session-');
    }
  });

  it('creates isolated lease keys by operation', () => {
    expect(service.forLease('stt', 'user-a', 'session-a')).not.toBe(
      service.forLease('generation', 'user-a', 'session-a'),
    );
  });

  it('isolates environments and secrets', () => {
    expect(service.forUser('user-a')).not.toBe(
      new RateLimitKeyService('s'.repeat(32), 'production').forUser('user-a'),
    );
    expect(service.forUser('user-a')).not.toBe(
      new RateLimitKeyService('x'.repeat(32), 'test').forUser('user-a'),
    );
  });

  it('length-prefixes components to avoid ambiguous concatenation', () => {
    expect(service.forUserSession('ab', 'c')).not.toBe(
      service.forUserSession('a', 'bc'),
    );
  });
});
