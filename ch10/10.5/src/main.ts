import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import { AppModule } from './app.module';
import * as nunjucks from 'nunjucks';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Validation 설정
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );

  // 넌적스 설정
  const viewsPath = join(__dirname, '..', 'views');

  nunjucks.configure(viewsPath, {
    watch: true,
    express: app.getHttpAdapter().getInstance(),
  });

  app.setBaseViewsDir(viewsPath);
  app.setViewEngine('html');

  // 정적 파일 경로 설정
  app.useStaticAssets(join(__dirname, '..', 'public'));

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
