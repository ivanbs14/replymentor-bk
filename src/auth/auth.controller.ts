import { Body, Controller, Get, Req, Post, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { AUTH_COOKIE_NAME, AuthConfigService } from './auth-config.service';
import { AuthDto } from './dto/auth.dto';
import { Public } from './public.decorator';
import { RateLimitPolicy } from '../rate-limit/rate-limit.decorator';

type AuthenticatedRequest = Request & {
  user: { userId: string; email: string };
};

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly authConfig: AuthConfigService,
  ) {}

  @Public()
  @RateLimitPolicy({
    group: 'auth_register_ip',
    identity: 'ip',
    failMode: 'closed',
  })
  @Post('register')
  async register(
    @Body() payload: AuthDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { token, user } = await this.authService.register(payload);
    response.cookie(AUTH_COOKIE_NAME, token, this.authConfig.cookieOptions());
    return { user };
  }

  @Public()
  @RateLimitPolicy(
    { group: 'auth_login_ip', identity: 'ip', failMode: 'closed' },
    { group: 'auth_login_account', identity: 'account', failMode: 'closed' },
  )
  @Post('login')
  async login(
    @Body() payload: AuthDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { token, user } = await this.authService.login(payload);
    response.cookie(AUTH_COOKIE_NAME, token, this.authConfig.cookieOptions());
    return { user };
  }

  @Public()
  @RateLimitPolicy({
    group: 'auth_logout',
    identity: 'user',
    failMode: 'closed',
  })
  @Post('logout')
  logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie(
      AUTH_COOKIE_NAME,
      this.authConfig.clearCookieOptions(),
    );
    return { success: true };
  }

  @RateLimitPolicy({
    group: 'read_default',
    identity: 'user',
    failMode: 'open',
  })
  @Get('me')
  me(@Req() request: AuthenticatedRequest) {
    return this.authService.me(request.user.userId);
  }
}
