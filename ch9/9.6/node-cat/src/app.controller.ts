import { Controller, Get, OnModuleInit, OnApplicationBootstrap, UseInterceptors } from '@nestjs/common';
import { AppService } from './app.service';
import { ConfigService } from '@nestjs/config';
import { LoggerInterceptor } from './logger/logger.interceptor';

@Controller()
export class AppController implements OnModuleInit, OnApplicationBootstrap {
  constructor(
    private readonly appService: AppService,
    private readonly configService: ConfigService,
  ) {}

  onModuleInit() {
    console.log('AppController init');
  }

  onApplicationBootstrap() {
    console.log('AppController bootstrap');
  }

  @Get()
  @UseInterceptors(LoggerInterceptor)
  getHello(): string {
    return this.appService.getHello();
  }
}
