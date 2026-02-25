import { SetMetadata } from '@nestjs/common';

export const RateLimit = (limit: number, windowMs?: number) => {
  return (target: any, key: string, descriptor?: any) => {
    SetMetadata('rateLimit', limit)(target, key, descriptor);
    if (windowMs) {
      SetMetadata('rateLimitWindow', windowMs)(target, key, descriptor);
    }
    return descriptor;
  };
};