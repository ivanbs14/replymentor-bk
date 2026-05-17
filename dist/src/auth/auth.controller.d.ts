import type { Request } from 'express';
import { AuthService } from './auth.service';
import type { AuthPayload } from './auth.types';
type AuthenticatedRequest = Request & {
    user: {
        userId: string;
        email: string;
    };
};
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
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
    me(request: AuthenticatedRequest): Promise<{
        id: string;
        email: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
export {};
