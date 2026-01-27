import { CanActivate, Injectable, ForbiddenException, ExecutionContext } from '@nestjs/common';
import { type Request } from 'express';

@Injectable()
export class IsLoggedInGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();
    if (request.isAuthenticated()) {
      return true;
    }
    throw new ForbiddenException('로그인이 필요합니다.');
  }
}
