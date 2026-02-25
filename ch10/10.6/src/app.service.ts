import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  constructor(private configService: ConfigService) {}

  getHello(): string {
    const port = this.configService.get<number>('port');
    const model = this.configService.get<string>('app.defaultProvider');
    return `${port} 포트에서 서버 작동 중, 기본 모델 ${model}`;
  }
}
