import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import type { Request } from 'express';
import { AuthConfigService } from './auth-config.service';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

@Injectable()
export class OriginGuard implements CanActivate {
  constructor(private readonly authConfig: AuthConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    if (SAFE_METHODS.has(request.method.toUpperCase())) return true;

    const origin = request.headers.origin;
    if (!origin) return true;
    if (!this.authConfig.isAllowedOrigin(origin)) {
      throw new ForbiddenException('Origem não autorizada.');
    }
    return true;
  }
}
