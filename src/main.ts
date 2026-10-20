import { NestFactory } from '@nestjs/core';
import { json, urlencoded } from 'express';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { AuthConfigService } from './auth/auth-config.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const authConfig = app.get(AuthConfigService);
  app.use(cookieParser());
  app.use(json({ limit: '25mb' }));
  app.use(urlencoded({ extended: true, limit: '25mb' }));
  app.enableCors({
    credentials: true,
    origin: authConfig.allowedOrigins,
  });
  await app.listen(process.env.PORT ?? 3001);
}
void bootstrap();
