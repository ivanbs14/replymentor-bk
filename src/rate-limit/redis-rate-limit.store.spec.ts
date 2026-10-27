import { RedisRateLimitStore } from './redis-rate-limit.store';
import { RateLimitStoreUnavailableError } from './rate-limit.types';

describe('RedisRateLimitStore', () => {
  const client = {
    eval: jest.fn(),
    set: jest.fn(),
  };
  const store = new RedisRateLimitStore(client);

  beforeEach(() => jest.clearAllMocks());

  it('serializes all policies into one atomic evaluation', async () => {
    client.eval.mockResolvedValue([1, 5, 4, 2_000_000_000, 0]);
    await expect(
      store.consume('identity', [
        { limit: 5, windowSeconds: 60 },
        { limit: 20, windowSeconds: 3600 },
      ]),
    ).resolves.toEqual({
      allowed: true,
      limit: 5,
      remaining: 4,
      resetEpochSeconds: 2_000_000_000,
      retryAfterSeconds: 0,
    });

    expect(client.eval).toHaveBeenCalledWith(expect.any(String), {
      keys: ['identity:60', 'identity:3600'],
      arguments: [expect.any(String), '2', '5', '60000', '20', '3600000'],
    });
  });

  it('returns a blocked decision', async () => {
    client.eval.mockResolvedValue([0, 5, 0, 2_000_000_000, 42]);
    await expect(
      store.consume('identity', [{ limit: 5, windowSeconds: 60 }]),
    ).resolves.toMatchObject({ allowed: false, retryAfterSeconds: 42 });
  });

  it.each([null, [], [1], ['bad', 1, 1, 1, 1]])(
    'sanitizes malformed store response %#',
    async (response) => {
      client.eval.mockResolvedValue(response);
      await expect(
        store.consume('identity', [{ limit: 1, windowSeconds: 60 }]),
      ).rejects.toBeInstanceOf(RateLimitStoreUnavailableError);
    },
  );

  it('sanitizes Redis errors', async () => {
    client.eval.mockRejectedValue(new Error('redis://secret@host'));
    await expect(
      store.consume('identity', [{ limit: 1, windowSeconds: 60 }]),
    ).rejects.toEqual(new RateLimitStoreUnavailableError());
  });

  it('acquires a lease atomically with TTL', async () => {
    client.set.mockResolvedValue('OK');
    await expect(store.acquireLease('lease', 'owner', 5_000)).resolves.toBe(
      true,
    );
    expect(client.set).toHaveBeenCalledWith('lease', 'owner', {
      NX: true,
      PX: 5_000,
    });
  });

  it('reports lease contention without overwriting ownership', async () => {
    client.set.mockResolvedValue(null);
    await expect(store.acquireLease('lease', 'second', 5_000)).resolves.toBe(
      false,
    );
  });

  it('releases a lease through compare-and-delete', async () => {
    client.eval.mockResolvedValue(1);
    await store.releaseLease('lease', 'owner');
    expect(client.eval).toHaveBeenCalledWith(expect.any(String), {
      keys: ['lease'],
      arguments: ['owner'],
    });
  });
});
