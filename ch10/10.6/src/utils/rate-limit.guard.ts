import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

@Injectable()
export class RateLimitGuard implements CanActivate {
  private requests = new Map<string, RateLimitRecord>();
  
  // 기본 설정: 분당 20회
  private readonly defaultLimit = 20;
  private readonly defaultWindowMs = 60 * 1000;

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    
    // 클라이언트 식별자 (IP 또는 사용자 ID)
    const clientId = this.getClientId(request);
    const now = Date.now();

    // 커스텀 limit 가져오기 (데코레이터로 설정 가능)
    const limit = this.reflector.get<number>('rateLimit', context.getHandler()) 
      || this.defaultLimit;
    const windowMs = this.reflector.get<number>('rateLimitWindow', context.getHandler()) 
      || this.defaultWindowMs;

    let record = this.requests.get(clientId);

    // 윈도우 리셋
    if (!record || now > record.resetTime) {
      record = {
        count: 0,
        resetTime: now + windowMs,
      };
    }

    record.count++;
    this.requests.set(clientId, record);

    // 응답 헤더에 Rate Limit 정보 추가
    const remaining = Math.max(0, limit - record.count);
    const resetSeconds = Math.ceil((record.resetTime - now) / 1000);
    
    response.setHeader('X-RateLimit-Limit', limit);
    response.setHeader('X-RateLimit-Remaining', remaining);
    response.setHeader('X-RateLimit-Reset', resetSeconds);

    if (record.count > limit) {
      response.setHeader('Retry-After', resetSeconds);
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: `요청이 너무 많습니다. ${resetSeconds}초 후에 다시 시도해주세요.`,
          retryAfter: resetSeconds,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return true;
  }

  private getClientId(request: any): string {
    // IP 주소 사용
    const ip = request.ip || 
      request.headers['x-forwarded-for']?.split(',')[0] || 
      request.socket?.remoteAddress;
    return `ip:${ip}`;
  }
}