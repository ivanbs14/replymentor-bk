"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
const password_util_1 = require("./password.util");
const jwt_util_1 = require("./jwt.util");
let AuthService = class AuthService {
    prisma;
    jwtSecret = process.env.JWT_SECRET || 'dev-only-change-me';
    constructor(prisma) {
        this.prisma = prisma;
    }
    async register(payload) {
        const data = this.validateCredentials(payload);
        const existingUser = await this.prisma.user.findUnique({
            where: { email: data.email },
        });
        if (existingUser) {
            throw new common_1.ConflictException('E-mail já cadastrado.');
        }
        const passwordHash = await (0, password_util_1.hashPassword)(data.password);
        const user = await this.prisma.user.create({
            data: {
                email: data.email,
                passwordHash,
            },
        });
        return this.createAuthResponse(user.id, user.email);
    }
    async login(payload) {
        const data = this.validateCredentials(payload);
        const user = await this.prisma.user.findUnique({
            where: { email: data.email },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Credenciais inválidas.');
        }
        const isValidPassword = await (0, password_util_1.verifyPassword)(data.password, user.passwordHash);
        if (!isValidPassword) {
            throw new common_1.UnauthorizedException('Credenciais inválidas.');
        }
        return this.createAuthResponse(user.id, user.email);
    }
    async me(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, email: true, createdAt: true, updatedAt: true },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Usuário não encontrado.');
        }
        return user;
    }
    validateCredentials(payload) {
        const email = payload.email?.trim().toLowerCase();
        const password = payload.password ?? '';
        if (!email || !email.includes('@')) {
            throw new common_1.BadRequestException('E-mail inválido.');
        }
        if (password.length < 6) {
            throw new common_1.BadRequestException('Senha deve ter pelo menos 6 caracteres.');
        }
        return { email, password };
    }
    createAuthResponse(userId, email) {
        const accessToken = (0, jwt_util_1.signJwt)({ sub: userId, email }, this.jwtSecret);
        return {
            accessToken,
            user: {
                id: userId,
                email,
            },
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AuthService);
//# sourceMappingURL=auth.service.js.map