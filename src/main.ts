import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configureApp } from './app.setup';
import { OperationalLogger } from './observability/operational-logger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new OperationalLogger(),
  });
  configureApp(app);
  await app.listen(process.env.PORT ?? 3001);
}
void bootstrap();
