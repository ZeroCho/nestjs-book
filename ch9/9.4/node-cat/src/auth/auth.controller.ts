import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { IsNotLoggedInGuard } from './is-not-logged-in.guard';
import { IsLoggedInGuard } from './is-logged-in.guard';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService, 
    private readonly configService: ConfigService
  ) {}

  // POST /auth/join
  @UseGuards(IsNotLoggedInGuard)
  @Post('join')
  join() {}

  // POST /auth/login
  @UseGuards(IsNotLoggedInGuard)
  @Post('login')
  login() {}

  // GET /auth/logout
  @UseGuards(IsLoggedInGuard)
  @Get('logout')
  logout() {}

  @UseGuards(IsNotLoggedInGuard)
  @Get('kakao')
  kakao() {}

  @UseGuards(IsNotLoggedInGuard)
  @Get('kakao/callback')
  kakaoCallback() {}
}
