import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { IsNotLoggedInGuard } from './is-not-logged-in.guard';
import { IsLoggedInGuard } from './is-logged-in.guard';
import { LocalAuthGuard } from './local-auth.guard';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(IsNotLoggedInGuard)
  @Post('join')
  join() {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  login() {}

  @UseGuards(IsLoggedInGuard)
  @Get('logout')
  logout() {}

  @UseGuards(AuthGuard('kakao'))
  @Get('kakao')
  kakao() {}

  @UseGuards(AuthGuard('kakao'))
  @Get('kakao/callback')
  kakaoCallback() {}
}
