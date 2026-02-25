import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'node:path';
import nunjucks from 'nunjucks';
import { AppModule } from './app.module';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import passport from 'passport';
import { SessionSocketIoAdapter } from './auth/socket-io.adapter';
import { WinstonModule } from 'nest-winston';
import { format, transports } from 'winston';
import helmet from 'helmet';
import { REDIS } from './redis/redis.module';
import { RedisStore } from 'connect-redis';
import type { RedisClientType } from 'redis';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger:
      process.env.NODE_ENV === 'production'
        ? WinstonModule.createLogger({
            level: 'info',
            exitOnError: false,
            format: format.combine(format.timestamp(), format.json()),
            transports: [
              new transports.Console(),
              new transports.File({
                filename: 'combined.log',
              }),
              new transports.File({
                filename: 'error.log',
                level: 'error',
              }),
            ],
          })
        : WinstonModule.createLogger({
            level: 'debug',
            format: format.cli(),
            exitOnError: false,
            transports: [new transports.Console()],
          }),
  });
  const express = app.getHttpAdapter().getInstance();
  const views = join(__dirname, '..', 'views');
  nunjucks.configure(views, { express, watch: true });
  app.setViewEngine('html');
  app.setBaseViewsDir(views);

  if (process.env.NODE_ENV === 'production') {
    app.use(
      helmet({
        contentSecurityPolicy: false,
        crossOriginEmbedderPolicy: false,
        crossOriginResourcePolicy: false,
      }),
    );
    app.use(morgan('combined'));
  } else {
    app.use(morgan('dev'));
  }

  app.use(cookieParser(process.env.COOKIE_SECRET));

  const redisClient = app.get<RedisClientType>(REDIS);
  // 세션 설정
  const sessionOption: session.SessionOptions = {
    store: new RedisStore({ client: redisClient }),
    resave: false,
    saveUninitialized: false,
    secret: process.env.COOKIE_SECRET!,
    cookie: {
      httpOnly: true,
      secure: false,
    },
  };
  if (process.env.NODE_ENV === 'production') {
    sessionOption.proxy = true;
    // sessionOption.cookie.secure = true;
  }
  const sessionMiddleware = session(sessionOption);

  app.use(sessionMiddleware);
  app.use(passport.initialize());
  app.use(passport.session());

  app.useWebSocketAdapter(new SessionSocketIoAdapter(app, sessionMiddleware));

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
