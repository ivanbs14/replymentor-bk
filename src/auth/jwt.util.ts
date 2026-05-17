import { createHmac } from 'node:crypto';
import { UnauthorizedException } from '@nestjs/common';
import type { JwtPayload } from './auth.types';

const TOKEN_TTL_SECONDS = 60 * 60 * 24;

function base64UrlEncode(value: string): string {
  return Buffer.from(value)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function base64UrlDecode(value: string): string {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padding =
    normalized.length % 4 === 0 ? '' : '='.repeat(4 - (normalized.length % 4));
  return Buffer.from(`${normalized}${padding}`, 'base64').toString('utf8');
}

function signSegment(segment: string, secret: string): string {
  return createHmac('sha256', secret)
    .update(segment)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

export function signJwt(
  payload: { sub: string; email: string },
  secret: string,
): string {
  const now = Math.floor(Date.now() / 1000);
  const fullPayload: JwtPayload = {
    sub: payload.sub,
    email: payload.email,
    exp: now + TOKEN_TTL_SECONDS,
  };

  const header = { alg: 'HS256', typ: 'JWT' };
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(fullPayload));
  const signingInput = `${encodedHeader}.${encodedPayload}`;
  const signature = signSegment(signingInput, secret);
  return `${signingInput}.${signature}`;
}

export function verifyJwt(token: string, secret: string): JwtPayload {
  const [encodedHeader, encodedPayload, signature] = token.split('.');
  if (!encodedHeader || !encodedPayload || !signature) {
    throw new UnauthorizedException('Token inválido.');
  }

  const signingInput = `${encodedHeader}.${encodedPayload}`;
  const expectedSignature = signSegment(signingInput, secret);
  if (signature !== expectedSignature) {
    throw new UnauthorizedException('Token inválido.');
  }

  let payload: JwtPayload;
  try {
    payload = JSON.parse(base64UrlDecode(encodedPayload)) as JwtPayload;
  } catch {
    throw new UnauthorizedException('Token inválido.');
  }

  const now = Math.floor(Date.now() / 1000);
  if (typeof payload.exp !== 'number' || payload.exp <= now) {
    throw new UnauthorizedException('Token expirado.');
  }
  if (typeof payload.sub !== 'string' || typeof payload.email !== 'string') {
    throw new UnauthorizedException('Token inválido.');
  }

  return payload;
}
