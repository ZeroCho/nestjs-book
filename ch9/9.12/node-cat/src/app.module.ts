import { Module, NestModule, MiddlewareConsumer, RequestMethod, OnModuleInit, OnApplicationBootstrap } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerMiddleware } from './logger/logger.middleware';
import { AuthController } from './auth/auth.controller';
import { ServeStaticModule } from '@nestjs/serve-static';
import path from 'node:path';
import * as schema from './drizzle/schema';
import * as relations from './drizzle/relations';
import { DrizzleModule } from './drizzle/drizzle.module';
import { PostModule } from './post/post.module';
import { UserModule } from './user/user.module';
import { EventsModule } from './events/events.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import fs from 'node:fs';
import { APP_FILTER } from '@nestjs/core';
import { AllExceptionsFilter } from './common/all-exceptions.filter';

@Module({
  imports: [
    EventsModule,
    EventEmitterModule.forRoot({ wildcard: true }),
    AuthModule,
    PostModule,
    UserModule,
    ConfigModule.forRoot({ isGlobal: true }),
    ServeStaticModule.forRoot({
      rootPath: path.join(__dirname, '..', 'public'),
      renderPath: '',
    }),
    ServeStaticModule.forRoot({
      rootPath: path.join(__dirname, '..', 'uploads'),
      serveRoot: '/img',
    }),
    DrizzleModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {  
        return {
          mysql: {
            user: "root",
            password: configService.get<string>('DB_PASSWORD'),
            host: "localhost",
            port: 3306,
            database: "nodebird",
            connectionLimit: 10,
          },
          config: {
            logger: true,
            schema: { ...schema, ...relations },
            mode: "default"
          },
        };
      },
      isGlobal: true,
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
  ],
})
export class AppModule implements NestModule, OnModuleInit, OnApplicationBootstrap {
  onModuleInit() {
    console.log('AppModule init');
  }

  onApplicationBootstrap() {
    console.log('AppModule bootstrap');
    try {
      fs.readdirSync('uploads');
    } catch (error) {
      console.error('uploads 폴더가 없어 uploads 폴더를 생성합니다.');
      fs.mkdirSync('uploads');
    }
  }

  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .exclude('auth/kakao', { path: 'auth/login', method: RequestMethod.POST })
      .forRoutes(AuthController);
  }
}
