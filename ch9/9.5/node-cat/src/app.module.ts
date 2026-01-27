import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
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
