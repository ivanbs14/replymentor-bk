import { type INestApplication, ValidationPipe } from '@nestjs/common';
import { json, urlencoded } from 'express';
import type { ValidationError } from 'class-validator';
import cookieParser from 'cookie-parser';
import { AuthConfigService } from './auth/auth-config.service';
import { JSON_BODY_LIMIT, URL_ENCODED_BODY_LIMIT } from './common/api-contract';
import {
  ApiExceptionFilter,
  validationException,
  type ValidationIssue,
} from './common/api-exception.filter';
import { OperationalLogger } from './observability/operational-logger';

function flattenValidationErrors(
  errors: ValidationError[],
  parent = '',
): ValidationIssue[] {
  return errors.flatMap((error) => {
    const field = parent ? `${parent}.${error.property}` : error.property;
    return [
      ...Object.keys(error.constraints ?? {}).map((rule) => ({ field, rule })),
      ...flattenValidationErrors(error.children ?? [], field),
    ];
  });
}

export function configureApp(app: INestApplication) {
  const authConfig = app.get(AuthConfigService);
  app.use(cookieParser());
  app.use(json({ limit: JSON_BODY_LIMIT }));
  app.use(urlencoded({ extended: true, limit: URL_ENCODED_BODY_LIMIT }));
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      stopAtFirstError: false,
      exceptionFactory: (errors) =>
        validationException(flattenValidationErrors(errors)),
    }),
  );
  app.useGlobalFilters(new ApiExceptionFilter(app.get(OperationalLogger)));
  app.enableCors({
    credentials: true,
    origin: authConfig.allowedOrigins,
    exposedHeaders: ['X-Request-ID'],
  });
}
