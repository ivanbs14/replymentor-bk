import { PrismaService } from '../prisma.service';
import type { AuthPayload } from './auth.types';
export declare class AuthService {
    private readonly prisma;
    private readonly jwtSecret;
    constructor(prisma: PrismaService);
    register(payload: AuthPayload): Promise<{
        accessToken: string;
        user: {
            id: string;
            email: string;
        };
    }>;
    login(payload: AuthPayload): Promise<{
        accessToken: string;
        user: {
            id: string;
            email: string;
        };
    }>;
    me(userId: string): Promise<{
        id: string;
        email: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    private validateCredentials;
    private createAuthResponse;
}
