import { randomUUID } from 'node:crypto';
import { createClient } from 'redis';
import { RedisRateLimitStore } from '../src/rate-limit/redis-rate-limit.store';

const redisUrl = process.env.REDIS_URL_TEST;
const describeWithRedis = redisUrl ? describe : describe.skip;

describeWithRedis('RedisRateLimitStore integration', () => {
  const prefix = `replymentor:test:${randomUUID()}`;
  const first = createClient({ url: redisUrl });
  const second = createClient({ url: redisUrl });
  const firstStore = new RedisRateLimitStore(first);
  const secondStore = new RedisRateLimitStore(second);

  beforeAll(async () => {
    await Promise.all([first.connect(), second.connect()]);
  });

  afterAll(async () => {
    const keys = await first.keys(`${prefix}:*`);
    if (keys.length > 0) await first.del(keys);
    await Promise.all([first.quit(), second.quit()]);
  });

  it('shares counters atomically between clients and expires them', async () => {
    const rules = [{ limit: 2, windowSeconds: 1 }];
    await expect(
      firstStore.consume(`${prefix}:counter`, rules),
    ).resolves.toMatchObject({
      allowed: true,
      remaining: 1,
    });
    await expect(
      secondStore.consume(`${prefix}:counter`, rules),
    ).resolves.toMatchObject({
      allowed: true,
      remaining: 0,
    });
    await expect(
      firstStore.consume(`${prefix}:counter`, rules),
    ).resolves.toMatchObject({
      allowed: false,
    });
    await new Promise((resolve) => setTimeout(resolve, 1_100));
    await expect(
      secondStore.consume(`${prefix}:counter`, rules),
    ).resolves.toMatchObject({
      allowed: true,
    });
  });

  it('releases only the lease owner', async () => {
    const key = `${prefix}:lease`;
    await expect(firstStore.acquireLease(key, 'owner', 5_000)).resolves.toBe(
      true,
    );
    await secondStore.releaseLease(key, 'not-owner');
    await expect(secondStore.acquireLease(key, 'second', 5_000)).resolves.toBe(
      false,
    );
    await firstStore.releaseLease(key, 'owner');
    await expect(secondStore.acquireLease(key, 'second', 5_000)).resolves.toBe(
      true,
    );
  });
});
