import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { type Request } from 'express';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  async canActivate(context: ExecutionContext) {
    try {
      const can = await super.canActivate(context);
      if (can) {
        const request = context.switchToHttp().getRequest<Request>();
        await super.logIn(request);
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
    return true;
  }
}
