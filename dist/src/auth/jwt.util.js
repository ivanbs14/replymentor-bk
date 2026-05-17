"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.signJwt = signJwt;
exports.verifyJwt = verifyJwt;
const node_crypto_1 = require("node:crypto");
const common_1 = require("@nestjs/common");
const TOKEN_TTL_SECONDS = 60 * 60 * 24;
function base64UrlEncode(value) {
    return Buffer.from(value)
        .toString('base64')
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');
}
function base64UrlDecode(value) {
    const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
    const padding = normalized.length % 4 === 0 ? '' : '='.repeat(4 - (normalized.length % 4));
    return Buffer.from(`${normalized}${padding}`, 'base64').toString('utf8');
}
function signSegment(segment, secret) {
    return (0, node_crypto_1.createHmac)('sha256', secret)
        .update(segment)
        .digest('base64')
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');
}
function signJwt(payload, secret) {
    const now = Math.floor(Date.now() / 1000);
    const fullPayload = {
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
function verifyJwt(token, secret) {
    const [encodedHeader, encodedPayload, signature] = token.split('.');
    if (!encodedHeader || !encodedPayload || !signature) {
        throw new common_1.UnauthorizedException('Token inválido.');
    }
    const signingInput = `${encodedHeader}.${encodedPayload}`;
    const expectedSignature = signSegment(signingInput, secret);
    if (signature !== expectedSignature) {
        throw new common_1.UnauthorizedException('Token inválido.');
    }
    let payload;
    try {
        payload = JSON.parse(base64UrlDecode(encodedPayload));
    }
    catch {
        throw new common_1.UnauthorizedException('Token inválido.');
    }
    const now = Math.floor(Date.now() / 1000);
    if (typeof payload.exp !== 'number' || payload.exp <= now) {
        throw new common_1.UnauthorizedException('Token expirado.');
    }
    if (typeof payload.sub !== 'string' || typeof payload.email !== 'string') {
        throw new common_1.UnauthorizedException('Token inválido.');
    }
    return payload;
}
//# sourceMappingURL=jwt.util.js.map