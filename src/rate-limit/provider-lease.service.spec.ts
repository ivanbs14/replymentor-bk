import { OperationalLogger } from '../observability/operational-logger';
import { ProviderLeaseService } from './provider-lease.service';
import {
  RateLimitExceededException,
  RateLimitStoreUnavailableException,
} from './rate-limit.exception';
import { RateLimitKeyService } from './rate-limit-key.service';
import {
  RateLimitStoreUnavailableError,
  type RateLimitStore,
} from './rate-limit.types';

describe('ProviderLeaseService', () => {
  function setup(storeOverrides?: Partial<RateLimitStore>) {
    const acquiredTokens: string[] = [];
    const releasedTokens: string[] = [];
    const acquireLease = jest.fn(
      (_key: string, token: string, _ttlMs: number) => {
        void _ttlMs;
        acquiredTokens.push(token);
        return Promise.resolve(true);
      },
    );
    const releaseLease = jest.fn((_key: string, token: string) => {
      releasedTokens.push(token);
      return Promise.resolve();
    });
    const store: RateLimitStore = {
      consume: jest.fn(),
      acquireLease,
      releaseLease,
      ...storeOverrides,
    };
    const loggerError = jest.fn();
    const service = new ProviderLeaseService(
      store,
      new RateLimitKeyService('s'.repeat(32), 'test'),
      { error: loggerError } as unknown as OperationalLogger,
    );
    return {
      acquireLease: storeOverrides?.acquireLease ?? acquireLease,
      acquiredTokens,
      loggerError,
      releaseLease: storeOverrides?.releaseLease ?? releaseLease,
      releasedTokens,
      service,
    };
  }

  it('holds a private lease only while provider work is in flight', async () => {
    let finish: (() => void) | undefined;
    const pending = new Promise<void>((resolve) => {
      finish = resolve;
    });
    const fixture = setup();
    const running = fixture.service.run(
      { kind: 'stt', userId: 'user-a', sessionId: 'session-a', ttlMs: 65_000 },
      () => pending,
    );
    await Promise.resolve();
    expect(fixture.acquireLease).toHaveBeenCalledWith(
      expect.not.stringContaining('user-a'),
      expect.any(String),
      65_000,
    );
    expect(fixture.releaseLease).not.toHaveBeenCalled();
    finish?.();
    await running;
    expect(fixture.releaseLease).toHaveBeenCalledTimes(1);
    expect(fixture.releasedTokens).toEqual(fixture.acquiredTokens);
  });

  it('rejects a concurrent operation without calling its work', async () => {
    const fixture = setup({
      acquireLease: jest.fn().mockResolvedValue(false),
    });
    const work = jest.fn();
    await expect(
      fixture.service.run(
        {
          kind: 'generation',
          userId: 'user-a',
          sessionId: 'session-a',
          ttlMs: 50_000,
        },
        work,
      ),
    ).rejects.toBeInstanceOf(RateLimitExceededException);
    expect(work).not.toHaveBeenCalled();
    expect(fixture.releaseLease).not.toHaveBeenCalled();
  });

  it('fails closed when the store cannot reserve a lease', async () => {
    const fixture = setup({
      acquireLease: jest
        .fn()
        .mockRejectedValue(new RateLimitStoreUnavailableError()),
    });
    await expect(
      fixture.service.run(
        { kind: 'stt', userId: 'user-a', sessionId: 'session-a', ttlMs: 1 },
        jest.fn(),
      ),
    ).rejects.toBeInstanceOf(RateLimitStoreUnavailableException);
  });

  it('does not replace a completed provider result when release fails', async () => {
    const fixture = setup({
      releaseLease: jest
        .fn()
        .mockRejectedValue(new RateLimitStoreUnavailableError()),
    });
    await expect(
      fixture.service.run(
        { kind: 'stt', userId: 'user-a', sessionId: 'session-a', ttlMs: 1 },
        () => Promise.resolve('done'),
      ),
    ).resolves.toBe('done');
    expect(fixture.loggerError).toHaveBeenCalledWith(
      expect.objectContaining({ outcome: 'lease_release_failed' }),
    );
  });
});
