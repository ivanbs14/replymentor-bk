import {
  ArgumentsHost,
  BadGatewayException,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
  PayloadTooLargeException,
  ServiceUnavailableException,
  UnsupportedMediaTypeException,
  GatewayTimeoutException,
} from '@nestjs/common';
import type { Response } from 'express';

export type ValidationIssue = { field: string; rule: string };

export function validationException(issues: ValidationIssue[]): HttpException {
  if (issues.some((issue) => issue.rule === 'maxAudioSize')) {
    return new PayloadTooLargeException({
      code: 'PAYLOAD_TOO_LARGE',
      message: 'Áudio excede o limite permitido.',
    });
  }
  if (
    issues.some((issue) => issue.field === 'mimeType' && issue.rule === 'isIn')
  ) {
    return new UnsupportedMediaTypeException({
      code: 'UNSUPPORTED_MEDIA_TYPE',
      message: 'Tipo de áudio não permitido.',
    });
  }
  return new HttpException(
    { code: 'VALIDATION_ERROR', message: 'Payload inválido.', errors: issues },
    HttpStatus.BAD_REQUEST,
  );
}

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ApiExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();
    const middlewareStatus: unknown =
      typeof exception === 'object' && exception !== null
        ? (Reflect.get(exception, 'status') ??
          Reflect.get(exception, 'statusCode'))
        : undefined;
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : typeof middlewareStatus === 'number' &&
            middlewareStatus >= 400 &&
            middlewareStatus <= 599
          ? middlewareStatus
          : HttpStatus.INTERNAL_SERVER_ERROR;
    const body =
      exception instanceof HttpException ? exception.getResponse() : null;
    const safeBody =
      typeof body === 'object' && body !== null
        ? (body as Record<string, unknown>)
        : {};
    const defaults: Record<number, { code: string; message: string }> = {
      400: { code: 'BAD_REQUEST', message: 'Requisição inválida.' },
      401: { code: 'UNAUTHORIZED', message: 'Não autorizado.' },
      403: { code: 'FORBIDDEN', message: 'Acesso negado.' },
      404: { code: 'NOT_FOUND', message: 'Recurso não encontrado.' },
      409: {
        code: 'CONFLICT',
        message: 'Conflito ao processar a solicitação.',
      },
      413: {
        code: 'PAYLOAD_TOO_LARGE',
        message: 'Payload excede o limite permitido.',
      },
      415: {
        code: 'UNSUPPORTED_MEDIA_TYPE',
        message: 'Tipo de mídia não permitido.',
      },
      502: {
        code: 'PROVIDER_BAD_RESPONSE',
        message: 'O provedor retornou uma resposta inválida.',
      },
      503: {
        code: 'PROVIDER_UNAVAILABLE',
        message: 'O provedor está indisponível.',
      },
      504: {
        code: 'PROVIDER_TIMEOUT',
        message: 'O provedor excedeu o tempo limite.',
      },
      500: { code: 'INTERNAL_ERROR', message: 'Erro interno.' },
    };
    const fallback = defaults[status] ?? defaults[500];
    const hasExplicitContract = typeof safeBody.code === 'string';
    if (!(exception instanceof HttpException) && status >= 500)
      this.logger.error('Falha inesperada na API.');
    response.status(status).json({
      statusCode: status,
      code: hasExplicitContract ? (safeBody.code as string) : fallback.code,
      message:
        hasExplicitContract && typeof safeBody.message === 'string'
          ? safeBody.message
          : fallback.message,
      ...(Array.isArray(safeBody.errors) ? { errors: safeBody.errors } : {}),
    });
  }
}

export const ProviderBadGatewayException = BadGatewayException;
export const ProviderUnavailableException = ServiceUnavailableException;
export const ProviderTimeoutException = GatewayTimeoutException;
