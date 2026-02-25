import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common';
import { TooManyRequestsException } from './too-many-requests.exception';
import type { Response } from 'express';

@Catch(HttpException)
export class HttpFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();
    if (exception instanceof TooManyRequestsException) {
      return response.status(429).json({
        code: 4118,
        msg: '요청이 너무 많습니다.',
      });
    }
    return response.status(exception.getStatus()).json({
      code: exception.getStatus(),
      msg: exception.message || 'Internal Server Error',
    });
  }
}
