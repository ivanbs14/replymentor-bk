import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect((response) => {
        const body = response.body as {
          service: string;
          status: string;
          timestamp: string;
        };

        expect(body).toMatchObject({
          service: 'replymentor-backend',
          status: 'ok',
        });
        expect(typeof body.timestamp).toBe('string');
        expect(Number.isNaN(Date.parse(body.timestamp))).toBe(false);
      });
  });

  afterEach(async () => {
    await app.close();
  });
});
