import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import type { AuthPayload } from './auth.types';
import { hashPassword, verifyPassword } from './password.util';
import { signJwt } from './jwt.util';

@Injectable()
export class AuthService {
  private readonly jwtSecret = process.env.JWT_SECRET || 'dev-only-change-me';

  constructor(private readonly prisma: PrismaService) {}

  async register(payload: AuthPayload) {
    const data = this.validateCredentials(payload);

    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existingUser) {
      throw new ConflictException('E-mail já cadastrado.');
    }

    const passwordHash = await hashPassword(data.password);

    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
      },
    });

    return this.createAuthResponse(user.id, user.email);
  }

  async login(payload: AuthPayload) {
    const data = this.validateCredentials(payload);

    const user = await this.prisma.user.findUnique({
      where: { email: data.email },
    });
    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas.');
    }

    const isValidPassword = await verifyPassword(
      data.password,
      user.passwordHash,
    );
    if (!isValidPassword) {
      throw new UnauthorizedException('Credenciais inválidas.');
    }

    return this.createAuthResponse(user.id, user.email);
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, createdAt: true, updatedAt: true },
    });
    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado.');
    }
    return user;
  }

  private validateCredentials(payload: AuthPayload) {
    const email = payload.email?.trim().toLowerCase();
    const password = payload.password ?? '';

    if (!email || !email.includes('@')) {
      throw new BadRequestException('E-mail inválido.');
    }
    if (password.length < 6) {
      throw new BadRequestException('Senha deve ter pelo menos 6 caracteres.');
    }

    return { email, password };
  }

  private createAuthResponse(userId: string, email: string) {
    const accessToken = signJwt({ sub: userId, email }, this.jwtSecret);

    return {
      accessToken,
      user: {
        id: userId,
        email,
      },
    };
  }
}
