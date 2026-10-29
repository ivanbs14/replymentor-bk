import { Injectable } from '@nestjs/common';
import type { Request } from 'express';
import { isIP } from 'node:net';

export type ClientIpSource = 'express' | 'render';

@Injectable()
export class ClientIpResolver {
  constructor(private readonly source: ClientIpSource) {}

  resolve(request: Request): string | null {
    if (this.source === 'render') {
      const value = request.headers['cf-connecting-ip'];
      if (
        typeof value !== 'string' ||
        value !== value.trim() ||
        isIP(value) === 0
      ) {
        return null;
      }
      return value;
    }
    return request.ip || request.socket.remoteAddress || null;
  }
}
