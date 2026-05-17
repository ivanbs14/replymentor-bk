import type { JwtPayload } from './auth.types';
export declare function signJwt(payload: {
    sub: string;
    email: string;
}, secret: string): string;
export declare function verifyJwt(token: string, secret: string): JwtPayload;
