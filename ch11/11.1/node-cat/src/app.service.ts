import { Injectable, Logger } from '@nestjs/common';
import { OnModuleInit, OnApplicationBootstrap } from '@nestjs/common';

@Injectable()
export class AppService implements OnModuleInit, OnApplicationBootstrap {
  constructor(private readonly logger: Logger) {
    this.logger.log('AppService constructor');
    this.logger.error('에러가 기록됩니다.');
  }

  onModuleInit() {
    this.logger.log('AppService init');
  }

  onApplicationBootstrap() {
    this.logger.log('AppService bootstrap');
  }

  getHello(): string {
    return 'Hello World!';
  }
}
