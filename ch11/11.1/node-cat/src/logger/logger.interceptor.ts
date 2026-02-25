import { Injectable, NestInterceptor, ExecutionContext, CallHandler, InternalServerErrorException, BadGatewayException } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable()
export class LoggerInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next
      .handle()
      .pipe(
        map((data) => {
          return { data };
        }),
        catchError((error) => {
          if (error instanceof InternalServerErrorException) {
            return throwError(() => new BadGatewayException());
          }
          return throwError(() => error);
        })
      );
  }
}
