import { Module } from '@nestjs/common';
import * as Redis from 'redis';
import { ConfigService } from '@nestjs/config';

export const REDIS = Symbol('AUTH:REDIS');

export const redisFactory = (configService: ConfigService) => {
  const redisClient = Redis.createClient({
    url: configService.get('REDIS_URL'),
  });
  redisClient
    .connect()
    .then(() => {
      console.log('redis connected', configService.get('REDIS_URL'));
    })
    .catch(console.error);
  return redisClient;
};

@Module({
  providers: [
    {
      provide: REDIS,
      useFactory: redisFactory,
      inject: [ConfigService],
    },
  ],
  exports: [REDIS],
})
export class RedisModule {}
