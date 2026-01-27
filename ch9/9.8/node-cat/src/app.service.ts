import { Injectable, OnModuleInit, OnApplicationBootstrap } from '@nestjs/common';

@Injectable()
export class AppService implements OnModuleInit, OnApplicationBootstrap {
  onModuleInit() {
    console.log('AppService init');
  }

  onApplicationBootstrap() {
    console.log('AppService bootstrap');
  }

  getHello(): string {
    return 'Hello World!';
  }
}
