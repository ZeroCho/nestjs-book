import { CanActivate, Injectable, ForbiddenException, ExecutionContext } from '@nestjs/common';
import { type Request } from 'express';

@Injectable()
export class IsNotLoggedInGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();
    if (!request.isAuthenticated()) {
      return true;
    }
    throw new ForbiddenException('로그인하지 않은 사용자만 접근 가능합니다.');
  }
}
