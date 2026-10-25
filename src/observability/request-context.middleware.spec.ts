import { randomUUID } from 'node:crypto';
import { getCorrelationId, runWithRequestContext } from './request-context';
import { resolveRequestId } from './request-context.middleware';

describe('request correlation context', () => {
  it('accepts UUIDs and replaces missing or invalid values', () => {
    const supplied = randomUUID();
    expect(resolveRequestId(supplied.toUpperCase())).toBe(supplied);
    expect(resolveRequestId('not-a-uuid')).toMatch(
      /^[0-9a-f]{8}-[0-9a-f-]{27}$/,
    );
    expect(resolveRequestId(undefined)).not.toBe(supplied);
  });

  it('does not mix concurrent correlation IDs', async () => {
    const first = randomUUID();
    const second = randomUUID();
    const [seenFirst, seenSecond] = await Promise.all([
      runWithRequestContext({ correlationId: first }, async () => {
        await new Promise((resolve) => setTimeout(resolve, 5));
        return getCorrelationId();
      }),
      runWithRequestContext({ correlationId: second }, async () => {
        await Promise.resolve();
        return getCorrelationId();
      }),
    ]);
    expect([seenFirst, seenSecond]).toEqual([first, second]);
    expect(getCorrelationId()).toBeUndefined();
  });
});
