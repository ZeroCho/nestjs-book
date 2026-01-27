import { Module, OnApplicationBootstrap, OnModuleInit } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { LocalSerializer } from './local.serializer';
import { LocalStrategy } from './local.strategy';
import { KakaoStrategy } from './kakao.strategy';
import { CircularService } from './circular.service';

@Module({
  imports: [PassportModule.register({ session: true })],
  controllers: [AuthController],
  providers: [AuthService, LocalSerializer, LocalStrategy, KakaoStrategy, CircularService],
})
export class AuthModule implements OnModuleInit, OnApplicationBootstrap {
  onModuleInit() {
    console.log('AuthModule init');
  }

  onApplicationBootstrap() {
    console.log('AuthModule bootstrap');
  }
}
