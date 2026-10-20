import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { IS_PUBLIC_KEY } from './public.decorator';
import { AUTH_COOKIE_NAME, AuthConfigService } from './auth-config.service';
import type { JwtPayload } from './auth.types';

type AuthenticatedRequest = Request & {
  user?: { userId: string; email: string };
  cookies?: Record<string, string | undefined>;
};

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    private readonly authConfig: AuthConfigService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const cookies = request.cookies as unknown;
    const token =
      typeof cookies === 'object' && cookies !== null
        ? (cookies as Record<string, unknown>)[AUTH_COOKIE_NAME]
        : undefined;
    if (typeof token !== 'string' || !token) {
      throw new UnauthorizedException('Token não informado.');
    }

    let payload: JwtPayload;
    try {
      payload = this.jwtService.verify<JwtPayload>(token, {
        ...this.authConfig.verifyOptions(),
        secret: this.authConfig.secret,
      });
    } catch {
      throw new UnauthorizedException('Token inválido ou expirado.');
    }
    if (typeof payload.sub !== 'string' || typeof payload.email !== 'string') {
      throw new UnauthorizedException('Token inválido ou expirado.');
    }
    if (
      typeof payload.iat !== 'number' ||
      !Number.isFinite(payload.iat) ||
      typeof payload.exp !== 'number' ||
      !Number.isFinite(payload.exp) ||
      payload.exp <= payload.iat
    ) {
      throw new UnauthorizedException('Token inválido ou expirado.');
    }
    request.user = {
      userId: payload.sub,
      email: payload.email,
    };

    return true;
  }
}
