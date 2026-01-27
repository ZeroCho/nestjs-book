import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import type { Request, Response } from 'express';
import type { Socket } from 'socket.io';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const contextType = host.getType();

    if (contextType === 'http') {
      this.handleHttpException(exception, host);
    } else if (contextType === 'ws') {
      this.handleWebSocketException(exception, host);
    } else {
      console.error('알 수 없는 컨텍스트 타입:', contextType, exception);
    }
  }

  private handleHttpException(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest<Request>();
    const res = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal Server Error';

    if (exception instanceof NotFoundException) {
      status = 404;
      message = `${req.method} ${req.url} 라우터가 없습니다.`;
    } else if (exception instanceof BadRequestException) {
      status = exception.getStatus();
      const response = exception.getResponse() as { message: string[] };
      message = 'message' in response && Array.isArray(response.message)
        ? response.message.join(', ')
        : exception.message;
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.message;
    }

    res.locals.message = message;
    res.locals.error = process.env.NODE_ENV !== 'production' ? exception : {};

    res.status(status).render('error');
  }

  private handleWebSocketException(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToWs();
    const client = ctx.getClient<Socket>();

    let message = '서버 오류가 발생했습니다.';
    let errorCode = 'INTERNAL_ERROR';

    if (exception instanceof WsException) {
      message = exception.message;
      errorCode = 'WEBSOCKET_ERROR';
    } else if (exception instanceof Error) {
      message = exception.message;
      errorCode = 'GENERAL_ERROR';
    }

    console.error(exception);
    client.emit('error', {
      code: errorCode,
      message,
      timestamp: new Date().toISOString(),
    });
  }
}
