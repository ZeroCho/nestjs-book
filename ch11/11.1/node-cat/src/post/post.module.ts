import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { PostGateway } from './post.gateway';

@Module({
  controllers: [PostController],
  providers: [PostService, PostGateway],
})
export class PostModule {}
