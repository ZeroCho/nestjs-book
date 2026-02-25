import { Controller, Get, Render } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Render('index')
  getHome() {
    return {
      title: '홈',
    };
  }

  @Get('health')
  getHealth(): string {
    return this.appService.getHello();
  }
}
