"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashPassword = hashPassword;
exports.verifyPassword = verifyPassword;
const node_crypto_1 = require("node:crypto");
const node_util_1 = require("node:util");
const scrypt = (0, node_util_1.promisify)(node_crypto_1.scrypt);
const KEY_LENGTH = 64;
async function hashPassword(password) {
    const salt = (0, node_crypto_1.randomBytes)(16).toString('hex');
    const derivedKey = (await scrypt(password, salt, KEY_LENGTH));
    return `${salt}:${derivedKey.toString('hex')}`;
}
async function verifyPassword(password, storedHash) {
    const [salt, key] = storedHash.split(':');
    if (!salt || !key) {
        return false;
    }
    const keyBuffer = Buffer.from(key, 'hex');
    const derivedKey = (await scrypt(password, salt, KEY_LENGTH));
    if (keyBuffer.length !== derivedKey.length) {
        return false;
    }
    return (0, node_crypto_1.timingSafeEqual)(keyBuffer, derivedKey);
}
//# sourceMappingURL=password.util.js.map