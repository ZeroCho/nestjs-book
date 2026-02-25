import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import type { Socket } from 'socket.io';

export const User = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const contextType = ctx.getType();

    if (contextType === 'http') {
      const request = ctx.switchToHttp().getRequest<Request>();
      const user = request.user;
      return data ? user?.[data] : user;
    } else if (contextType === 'ws') {
      const client = ctx.switchToWs().getClient<Socket>();
      const request = client.request as Request;
      if (request && request.session) {
        const session = request.session;
        if (session.passport) {
          return session.passport.user;
        }
      }
      return null;
    }

    return null;
  },
);
