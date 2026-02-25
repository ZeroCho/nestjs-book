import { CanActivate, Injectable, ForbiddenException, ExecutionContext } from '@nestjs/common';
import { type Request } from 'express';

@Injectable()
export class IsNotLoggedInGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();
    if (!request.isAuthenticated()) {
      return true;
    }
    throw new ForbiddenException('이미 로그인되어 있습니다.');
  }
}
