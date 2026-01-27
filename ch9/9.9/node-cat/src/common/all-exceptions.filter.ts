import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
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
    res.locals.error =
      process.env.NODE_ENV !== 'production' ? exception : {};

    res.status(status).render('error');
  }
}
