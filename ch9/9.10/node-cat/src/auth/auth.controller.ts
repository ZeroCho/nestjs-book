import { Controller, Get, Post, UseGuards, Req, Res, Redirect, Body, UsePipes, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { IsNotLoggedInGuard } from './is-not-logged-in.guard';
import { IsLoggedInGuard } from './is-logged-in.guard';
import { LocalAuthGuard } from './local-auth.guard';
import { AuthGuard } from '@nestjs/passport';
import type { Request, Response } from 'express';
import { JoinDto } from './dto/join.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(IsNotLoggedInGuard)
  @UsePipes(ValidationPipe)
  @Post('join')
  @Redirect('/')
  async join(@Body() body: JoinDto) {
    try {
      await this.authService.join(body);
    } catch (error) {
      if (error.message === 'already_exist') {
        return { url: '/join?error=exist' };
      }
      return { url: `/join?error=${error.message}` };
    }
  }

  @UseGuards(LocalAuthGuard)
  @Redirect('/')
  @Post('login')
  login() {}

  @UseGuards(IsLoggedInGuard)
  @Get('logout')
  logout(@Req() req: Request, @Res() res: Response) {
    req.logout(() => {
      res.redirect('/');
    });
  }

  @UseGuards(AuthGuard('kakao'))
  @Get('kakao')
  kakao() {}

  @UseGuards(AuthGuard('kakao'))
  @Get('kakao/callback')
  @Redirect('/')
  kakaoCallback() {}
}
