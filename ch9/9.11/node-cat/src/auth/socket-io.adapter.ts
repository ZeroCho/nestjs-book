import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions, type Socket } from 'socket.io';
import type { NextFunction, RequestHandler, Request, Response } from 'express';
import type { INestApplicationContext } from '@nestjs/common';

export class SessionSocketIoAdapter extends IoAdapter {
  private sessionMiddleware: RequestHandler;

  constructor(app: INestApplicationContext, sessionMiddleware: RequestHandler) {
    super(app);
    this.sessionMiddleware = sessionMiddleware;
  }

  create(port: number, options?: ServerOptions) {
    const server = super.create(port, options);

    server.use((socket: Socket, next: NextFunction) => {
      this.sessionMiddleware(socket.request as Request, {} as Response, next);
    });

    return server;
  }
}
