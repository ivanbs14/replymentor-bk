import { Inject, Module, type OnApplicationShutdown } from '@nestjs/common';
import { createClient, type RedisClientType } from 'redis';
import { OperationalLogger } from '../observability/operational-logger';
import { ClientIpResolver } from './client-ip.resolver';
import { RateLimitConfig } from './rate-limit.config';
import { RateLimitGuard } from './rate-limit.guard';
import { RateLimitKeyService } from './rate-limit-key.service';
import { RedisRateLimitStore } from './redis-rate-limit.store';
import {
  RATE_LIMIT_CONFIG,
  RATE_LIMIT_STORE,
  REDIS_RATE_LIMIT_CLIENT,
} from './rate-limit.tokens';
import type { RateLimitStore } from './rate-limit.types';
import { ProviderLeaseService } from './provider-lease.service';

class TestRateLimitStore implements RateLimitStore {
  consume() {
    return Promise.resolve({
      allowed: true,
      limit: Number.MAX_SAFE_INTEGER,
      remaining: Number.MAX_SAFE_INTEGER,
      resetEpochSeconds: Math.ceil(Date.now() / 1000) + 60,
      retryAfterSeconds: 0,
    });
  }
  acquireLease(): Promise<boolean> {
    return Promise.resolve(true);
  }
  releaseLease(): Promise<void> {
    return Promise.resolve();
  }
}

@Module({
  providers: [
    OperationalLogger,
    {
      provide: RATE_LIMIT_CONFIG,
      useFactory: () => RateLimitConfig.fromEnv(),
    },
    {
      provide: REDIS_RATE_LIMIT_CLIENT,
      useFactory: async (
        config: RateLimitConfig,
        logger: OperationalLogger,
      ): Promise<RedisClientType | null> => {
        if (!config.redisUrl) return null;
        const client = createClient({
          url: config.redisUrl,
          socket: {
            connectTimeout: 1_000,
            reconnectStrategy: (retries) => Math.min(50 * 2 ** retries, 1_000),
          },
        });
        client.on('error', () =>
          logger.error({
            event: 'rate_limit_store_unavailable',
            outcome: 'connection_error',
            errorCode: 'RATE_LIMIT_STORE_UNAVAILABLE',
          }),
        );
        await client.connect();
        return client;
      },
      inject: [RATE_LIMIT_CONFIG, OperationalLogger],
    },
    {
      provide: RATE_LIMIT_STORE,
      useFactory: (client: RedisClientType | null): RateLimitStore =>
        client ? new RedisRateLimitStore(client) : new TestRateLimitStore(),
      inject: [REDIS_RATE_LIMIT_CLIENT],
    },
    {
      provide: RateLimitKeyService,
      useFactory: (config: RateLimitConfig) =>
        new RateLimitKeyService(
          config.keySecret,
          process.env.NODE_ENV ?? 'development',
        ),
      inject: [RATE_LIMIT_CONFIG],
    },
    {
      provide: ClientIpResolver,
      useFactory: (config: RateLimitConfig) =>
        new ClientIpResolver(config.clientIpSource),
      inject: [RATE_LIMIT_CONFIG],
    },
    RateLimitGuard,
    ProviderLeaseService,
  ],
  exports: [
    RATE_LIMIT_CONFIG,
    RATE_LIMIT_STORE,
    RateLimitKeyService,
    RateLimitGuard,
    ProviderLeaseService,
  ],
})
export class RateLimitModule implements OnApplicationShutdown {
  constructor(
    @Inject(REDIS_RATE_LIMIT_CLIENT)
    private readonly client: RedisClientType | null,
  ) {}

  async onApplicationShutdown(): Promise<void> {
    if (this.client?.isOpen) await this.client.quit();
  }
}
