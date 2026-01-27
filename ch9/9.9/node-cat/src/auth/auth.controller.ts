import { Controller, Get, Post, UseGuards, OnModuleInit, OnApplicationBootstrap } from '@nestjs/common';
import { AuthService } from './auth.service';
import { IsNotLoggedInGuard } from './is-not-logged-in.guard';
import { IsLoggedInGuard } from './is-logged-in.guard';
import { LocalAuthGuard } from './local-auth.guard';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController implements OnModuleInit, OnApplicationBootstrap {
  constructor(private readonly authService: AuthService) {}

  onModuleInit() {
    console.log('AuthController init');
  }

  onApplicationBootstrap() {
    console.log('AuthController bootstrap');
  }

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
