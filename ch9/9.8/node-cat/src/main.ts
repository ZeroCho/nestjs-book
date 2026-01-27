import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'node:path';
import nunjucks from 'nunjucks';
import { AppModule } from './app.module';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import passport from 'passport';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const express = app.getHttpAdapter().getInstance();
  const views = join(__dirname, '..', 'views');
  nunjucks.configure(views, { express, watch: true });
  app.setViewEngine('html');
  app.setBaseViewsDir(views);
  app.use(morgan('dev'));
  app.use(cookieParser(process.env.COOKIE_SECRET));
  app.use(session({
    resave: false,
    saveUninitialized: false,
    secret: process.env.COOKIE_SECRET!,
    cookie: {
      httpOnly: true,
      secure: false,
    },
  }));
  app.use(passport.initialize());
  app.use(passport.session());
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
