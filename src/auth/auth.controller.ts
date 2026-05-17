import { Body, Controller, Get, Req, Post } from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from './auth.service';
import type { AuthPayload } from './auth.types';
import { Public } from './public.decorator';

type AuthenticatedRequest = Request & {
  user: { userId: string; email: string };
};

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  register(@Body() payload: AuthPayload) {
    return this.authService.register(payload);
  }

  @Public()
  @Post('login')
  login(@Body() payload: AuthPayload) {
    return this.authService.login(payload);
  }

  @Get('me')
  me(@Req() request: AuthenticatedRequest) {
    return this.authService.me(request.user.userId);
  }
}
