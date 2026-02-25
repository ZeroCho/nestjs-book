import {
  CanActivate,
  Injectable,
  ForbiddenException,
  ExecutionContext,
} from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import type { Request } from 'express';
import type { Socket } from 'socket.io';

interface SessionRequest {
  session?: SessionData;
}

interface SessionData {
  passport?: {
    user?: SessionUser;
  };
}

interface SessionUser {
  id: string;
}

@Injectable()
export class IsLoggedInGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const contextType = context.getType();

    if (contextType === 'http') {
      const request = context.switchToHttp().getRequest<Request>();
      if (request.isAuthenticated()) {
        return true;
      }
      throw new ForbiddenException('로그인이 필요합니다.');
    } else if (contextType === 'ws') {
      const client = context.switchToWs().getClient<Socket>();
      const request = client.request as SessionRequest;
      if (request && request.session) {
        const session = request.session;
        if (session.passport && session.passport.user) {
          return true;
        }
      }
      throw new WsException('로그인이 필요합니다.');
    }

    throw new ForbiddenException('지원하지 않는 컨텍스트 타입입니다.');
  }
}
