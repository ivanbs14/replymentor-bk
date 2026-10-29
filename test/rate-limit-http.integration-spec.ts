import {
  Body,
  Controller,
  Get,
  type INestApplication,
  Module,
  Param,
  Post,
} from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { randomUUID } from 'node:crypto';
import { json, type Request } from 'express';
import { createClient, type RedisClientType } from 'redis';
import request from 'supertest';
import type { App } from 'supertest/types';
import { ApiExceptionFilter } from '../src/common/api-exception.filter';
import { OperationalLogger } from '../src/observability/operational-logger';
import { RequestContextMiddleware } from '../src/observability/request-context.middleware';
import { ClientIpResolver } from '../src/rate-limit/client-ip.resolver';
import { RateLimitConfig } from '../src/rate-limit/rate-limit.config';
import { RateLimitPolicy } from '../src/rate-limit/rate-limit.decorator';
import { RateLimitExceededException } from '../src/rate-limit/rate-limit.exception';
import { RateLimitGuard } from '../src/rate-limit/rate-limit.guard';
import { RateLimitKeyService } from '../src/rate-limit/rate-limit-key.service';
import {
  RATE_LIMIT_CONFIG,
  RATE_LIMIT_STORE,
} from '../src/rate-limit/rate-limit.tokens';
import { RedisRateLimitStore } from '../src/rate-limit/redis-rate-limit.store';
import {
  RateLimitStoreUnavailableError,
  type RateLimitStore,
} from '../src/rate-limit/rate-limit.types';

const redisUrl = process.env.REDIS_URL_TEST;
const describeWithRedis = redisUrl ? describe : describe.skip;

@Controller('rate-limit-test')
class RateLimitTestController {
  loginCallCount = 0;

  @Get()
  @RateLimitPolicy({ group: 'health', identity: 'ip', failMode: 'open' })
  read(): { ok: true } {
    return { ok: true };
  }

  @Post('login')
  @RateLimitPolicy(
    { group: 'auth_login_ip', identity: 'ip', failMode: 'closed' },
    { group: 'auth_login_account', identity: 'account', failMode: 'closed' },
  )
  login(@Body() body: { email: string }): { ok: true } {
    void body;
    this.loginCallCount += 1;
    return { ok: true };
  }

  @Post('sessions/:sessionId/generate')
  @RateLimitPolicy({
    group: 'generate_response',
    identity: 'user-session',
    failMode: 'closed',
  })
  generate(@Param('sessionId') sessionId: string): { ok: true } {
    void sessionId;
    return { ok: true };
  }

  @Get('fail-open')
  @RateLimitPolicy({ group: 'health', identity: 'ip', failMode: 'open' })
  failOpen(): { ok: true } {
    return { ok: true };
  }

  @Post('fail-closed')
  @RateLimitPolicy({
    group: 'context_write',
    identity: 'ip',
    failMode: 'closed',
  })
  failClosed(): { ok: true } {
    return { ok: true };
  }

  @Get('concurrent')
  concurrent(): never {
    throw new RateLimitExceededException('RATE_LIMIT_CONCURRENT_OPERATION', 2);
  }
}

@Module({ controllers: [RateLimitTestController] })
class RateLimitHttpTestModule {}

describeWithRedis('Rate limiting distributed HTTP contract', () => {
  const keySecret = 'rate-limit-http-integration-secret'.padEnd(40, 'x');
  const environment = `integration-${randomUUID()}`;
  const clients: RedisClientType[] = [];
  const apps: INestApplication<App>[] = [];

  async function createApp(
    storeOverride?: RateLimitStore,
  ): Promise<INestApplication<App>> {
    let store = storeOverride;
    if (!store) {
      const client = createClient({ url: redisUrl });
      await client.connect();
      clients.push(client);
      store = new RedisRateLimitStore(client);
    }
    const config = RateLimitConfig.fromEnv({
      NODE_ENV: 'test',
      RATE_LIMIT_KEY_SECRET: keySecret,
      RATE_LIMITS_JSON: JSON.stringify({
        health: [{ limit: 2, windowSeconds: 60 }],
        auth_login_ip: [{ limit: 3, windowSeconds: 60 }],
        auth_login_account: [{ limit: 1, windowSeconds: 60 }],
        generate_response: [{ limit: 1, windowSeconds: 60 }],
      }),
    });
    const moduleRef = await Test.createTestingModule({
      imports: [RateLimitHttpTestModule],
      providers: [
        OperationalLogger,
        { provide: RATE_LIMIT_CONFIG, useValue: config },
        { provide: RATE_LIMIT_STORE, useValue: store },
        {
          provide: RateLimitKeyService,
          useValue: new RateLimitKeyService(keySecret, environment),
        },
        {
          provide: ClientIpResolver,
          useValue: new ClientIpResolver(config.clientIpSource),
        },
        RateLimitGuard,
        { provide: APP_GUARD, useExisting: RateLimitGuard },
      ],
    }).compile();
    const app = moduleRef.createNestApplication<INestApplication<App>>();
    const requestContext = new RequestContextMiddleware();
    app.use(requestContext.use.bind(requestContext));
    app.use(json());
    app.use((incoming: Request, _response: unknown, next: () => void) => {
      const userId = incoming.header('X-Test-User');
      if (userId)
        Reflect.set(incoming, 'user', {
          userId,
          email: `${userId}@example.test`,
        });
      next();
    });
    app.useGlobalFilters(new ApiExceptionFilter(app.get(OperationalLogger)));
    await app.init();
    apps.push(app);
    return app;
  }

  afterAll(async () => {
    await Promise.all(apps.map((app) => app.close()));
    const cleanup = createClient({ url: redisUrl });
    await cleanup.connect();
    const keys = await cleanup.keys(`*:replymentor:${environment}:*`);
    if (keys.length > 0) await cleanup.del(keys);
    await cleanup.quit();
    for (const client of clients) if (client.isOpen) await client.quit();
  });

  it('shares the HTTP counter and returns the public 429 contract', async () => {
    const first = await createApp();
    const second = await createApp();
    const firstRequestId = randomUUID();
    const allowedByFirst = await request(first.getHttpServer())
      .get('/rate-limit-test')
      .set('X-Request-ID', firstRequestId)
      .expect(200);
    expect(allowedByFirst.headers['ratelimit-limit']).toBe('2');
    expect(allowedByFirst.headers['ratelimit-remaining']).toBe('1');
    expect(allowedByFirst.headers['x-request-id']).toBe(firstRequestId);
    const allowedBySecond = await request(second.getHttpServer())
      .get('/rate-limit-test')
      .expect(200);
    expect(allowedBySecond.headers['ratelimit-remaining']).toBe('0');
    const blocked = await request(first.getHttpServer())
      .get('/rate-limit-test')
      .expect(429);
    expect(blocked.headers['retry-after']).toMatch(/^\d+$/);
    expect(blocked.headers['ratelimit-limit']).toBe('2');
    expect(blocked.headers['ratelimit-remaining']).toBe('0');
    expect(blocked.headers['ratelimit-reset']).toMatch(/^\d+$/);
    expect(blocked.body).toEqual({
      statusCode: 429,
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Muitas solicitações. Tente novamente mais tarde.',
      retryAfterSeconds: Number(blocked.headers['retry-after']),
      requestId: blocked.headers['x-request-id'],
    });
    expect(JSON.stringify(blocked.body)).not.toContain(keySecret);
    expect(JSON.stringify(blocked.body)).not.toContain(redisUrl);
  });

  it('applies login limits by account and IP before the controller', async () => {
    const first = await createApp();
    const second = await createApp();
    const firstController = first.get<RateLimitTestController>(
      RateLimitTestController,
    );
    const secondController = second.get<RateLimitTestController>(
      RateLimitTestController,
    );
    await request(first.getHttpServer())
      .post('/rate-limit-test/login')
      .send({ email: 'first@example.test' })
      .expect(201);
    await request(second.getHttpServer())
      .post('/rate-limit-test/login')
      .send({ email: 'first@example.test' })
      .expect(429);
    await request(first.getHttpServer())
      .post('/rate-limit-test/login')
      .send({ email: 'second@example.test' })
      .expect(201);
    await request(second.getHttpServer())
      .post('/rate-limit-test/login')
      .send({ email: 'third@example.test' })
      .expect(429);
    expect(firstController.loginCallCount).toBe(2);
    expect(secondController.loginCallCount).toBe(0);
  });

  it('isolates authenticated users and sessions', async () => {
    const app = await createApp();
    await request(app.getHttpServer())
      .post('/rate-limit-test/sessions/session-a/generate')
      .set('X-Test-User', 'user-a')
      .expect(201);
    await request(app.getHttpServer())
      .post('/rate-limit-test/sessions/session-a/generate')
      .set('X-Test-User', 'user-a')
      .expect(429);
    await request(app.getHttpServer())
      .post('/rate-limit-test/sessions/session-b/generate')
      .set('X-Test-User', 'user-a')
      .expect(201);
    await request(app.getHttpServer())
      .post('/rate-limit-test/sessions/session-a/generate')
      .set('X-Test-User', 'user-b')
      .expect(201);
  });

  it('uses fail-open for reads and fail-closed for mutations', async () => {
    const unavailableStore: RateLimitStore = {
      consume: jest
        .fn()
        .mockRejectedValue(new RateLimitStoreUnavailableError()),
      acquireLease: jest.fn(),
      releaseLease: jest.fn(),
    };
    const app = await createApp(unavailableStore);
    await request(app.getHttpServer())
      .get('/rate-limit-test/fail-open')
      .expect(200);
    await request(app.getHttpServer())
      .post('/rate-limit-test/fail-closed')
      .expect(503)
      .expect(({ body }) => {
        expect(body).toMatchObject({
          code: 'RATE_LIMIT_STORE_UNAVAILABLE',
          statusCode: 503,
        });
      });
  });

  it('adds rate-limit headers to concurrent-operation errors', async () => {
    const app = await createApp();
    const response = await request(app.getHttpServer())
      .get('/rate-limit-test/concurrent')
      .expect(429);
    expect(response.headers['retry-after']).toBe('2');
    expect(response.headers['ratelimit-limit']).toBe('1');
    expect(response.headers['ratelimit-remaining']).toBe('0');
    expect(response.headers['ratelimit-reset']).toMatch(/^\d+$/);
    expect(response.body).toMatchObject({
      code: 'RATE_LIMIT_CONCURRENT_OPERATION',
      retryAfterSeconds: 2,
    });
  });
});
