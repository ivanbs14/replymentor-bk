import { createHmac } from 'node:crypto';

type KeyKind = 'ip' | 'account' | 'user' | 'user-session' | 'lease';

export class RateLimitKeyService {
  constructor(
    private readonly secret: string,
    private readonly environment: string,
  ) {}

  forIp(ip: string): string {
    return this.derive('ip', [ip.trim().toLowerCase()]);
  }

  forAccount(email: string): string {
    return this.derive('account', [email.trim().toLocaleLowerCase('en-US')]);
  }

  forUser(userId: string): string {
    return this.derive('user', [userId]);
  }

  forUserSession(userId: string, sessionId: string): string {
    return this.derive('user-session', [userId, sessionId]);
  }

  forLease(kind: string, userId: string, sessionId: string): string {
    return this.derive('lease', [kind, userId, sessionId]);
  }

  private derive(kind: KeyKind, values: readonly string[]): string {
    const digest = createHmac('sha256', this.secret)
      .update(`${this.environment}:v1:${kind}:`)
      .update(values.map((value) => `${value.length}:${value}`).join('|'))
      .digest('hex');
    return `replymentor:${this.environment}:rate-limit:v1:${kind}:${digest}`;
  }
}
