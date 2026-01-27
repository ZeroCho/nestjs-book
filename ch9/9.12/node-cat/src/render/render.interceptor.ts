import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request, Response } from 'express';

@Injectable()
export class RenderInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req: Request = context.switchToHttp().getRequest();
    const res: Response = context.switchToHttp().getResponse();
    res.locals.user = req.user;
    res.locals.followerCount = req.user?.followers?.length ?? 0;
    res.locals.followingCount = req.user?.followings?.length ?? 0;
    res.locals.followingIdList = req.user?.followings?.map(f => f.following.id) ?? [];
    return next.handle();
  }
}
