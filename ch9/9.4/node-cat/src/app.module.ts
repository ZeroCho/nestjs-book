import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { LoggerMiddleware } from './logger/logger.middleware';
import { AuthController } from './auth/auth.controller';
import { ServeStaticModule } from '@nestjs/serve-static';
import path from 'node:path';

@Module({
  imports: [
    AuthModule,
    ConfigModule.forRoot({ isGlobal: true }),
    ServeStaticModule.forRoot({
      rootPath: path.join(__dirname, '..', 'public'),
    }),
    ServeStaticModule.forRoot({
      rootPath: path.join(__dirname, '..', 'uploads'),
      serveRoot: '/img',
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .exclude('auth/kakao', { path: 'auth/login', method: RequestMethod.POST })
      .forRoutes(AuthController);
  }
}
