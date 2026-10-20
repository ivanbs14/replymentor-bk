import { Injectable } from '@nestjs/common';
import type { CookieOptions } from 'express';
import type { Algorithm, SignOptions, VerifyOptions } from 'jsonwebtoken';

export const AUTH_COOKIE_NAME = 'replymentor_session';
export const JWT_TTL_SECONDS = 30 * 60;

type SameSite = 'lax' | 'strict' | 'none';

@Injectable()
export class AuthConfigService {
  readonly secret: string;
  readonly issuer: string;
  readonly audience: string;
  readonly algorithm: Algorithm = 'HS256';
  readonly allowedOrigins: string[];
  readonly secureCookie: boolean;
  readonly sameSite: SameSite;

  constructor() {
    const environment = process.env.NODE_ENV ?? 'development';
    const isLocal = environment === 'development' || environment === 'test';

    this.secret = this.required('JWT_SECRET');
    if (this.secret.length < 32) {
      throw new Error('JWT_SECRET deve ter pelo menos 32 caracteres.');
    }

    this.issuer = isLocal
      ? process.env.JWT_ISSUER?.trim() || 'replymentor-api'
      : this.required('JWT_ISSUER');
    this.audience = isLocal
      ? process.env.JWT_AUDIENCE?.trim() || 'replymentor-web'
      : this.required('JWT_AUDIENCE');

    const origins = process.env.CORS_ORIGINS?.trim();
    this.allowedOrigins = origins
      ? origins
          .split(',')
          .map((origin) => origin.trim())
          .filter(Boolean)
      : isLocal
        ? ['http://localhost:3000']
        : [];
    if (this.allowedOrigins.length === 0) {
      throw new Error(
        'CORS_ORIGINS deve listar ao menos uma origem permitida.',
      );
    }

    const secureValue = process.env.COOKIE_SECURE?.trim().toLowerCase();
    if (!isLocal && !secureValue) {
      throw new Error('COOKIE_SECURE é obrigatório fora do ambiente local.');
    }
    if (secureValue && !['true', 'false'].includes(secureValue)) {
      throw new Error('COOKIE_SECURE deve ser true ou false.');
    }
    this.secureCookie = secureValue ? secureValue === 'true' : false;

    const sameSiteValue = (process.env.COOKIE_SAME_SITE?.trim().toLowerCase() ||
      (isLocal ? 'lax' : '')) as SameSite;
    if (!['lax', 'strict', 'none'].includes(sameSiteValue)) {
      throw new Error('COOKIE_SAME_SITE deve ser lax, strict ou none.');
    }
    if (!isLocal && !this.secureCookie) {
      throw new Error('COOKIE_SECURE deve ser true fora do ambiente local.');
    }
    if (sameSiteValue === 'none' && !this.secureCookie) {
      throw new Error('COOKIE_SAME_SITE=none exige COOKIE_SECURE=true.');
    }
    this.sameSite = sameSiteValue;
  }

  signOptions(): SignOptions {
    return {
      algorithm: this.algorithm,
      audience: this.audience,
      expiresIn: JWT_TTL_SECONDS,
      issuer: this.issuer,
    };
  }

  verifyOptions(): VerifyOptions {
    return {
      algorithms: [this.algorithm],
      audience: this.audience,
      issuer: this.issuer,
    };
  }

  cookieOptions(): CookieOptions {
    return {
      httpOnly: true,
      maxAge: JWT_TTL_SECONDS * 1000,
      path: '/',
      sameSite: this.sameSite,
      secure: this.secureCookie,
    };
  }

  clearCookieOptions(): CookieOptions {
    return {
      httpOnly: true,
      path: '/',
      sameSite: this.sameSite,
      secure: this.secureCookie,
    };
  }

  isAllowedOrigin(origin: string): boolean {
    return this.allowedOrigins.includes(origin);
  }

  private required(name: string): string {
    const value = process.env[name]?.trim();
    if (!value) {
      throw new Error(`${name} é obrigatório.`);
    }
    return value;
  }
}
