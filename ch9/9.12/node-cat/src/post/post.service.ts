import { Injectable, Inject } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { posts, hashtags, postsToHashtags } from 'src/drizzle/schema';
import * as schema from 'src/drizzle/schema';
import { eq } from 'drizzle-orm';
import { MySql2Database } from 'drizzle-orm/mysql2';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class PostService {
  constructor(
    @Inject('DRIZZLE')
    private readonly db: MySql2Database<typeof schema>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(createPostDto: CreatePostDto, userId: string) {
    await this.db.insert(posts).values({
      content: createPostDto.content,
      img: createPostDto.url,
      userId: userId,
    });

    const insertId = await this.db.execute(
      'SELECT LAST_INSERT_ID() as insertId',
    );
    const postId = (insertId[0][0] as { insertId: number }).insertId;

    const hashtag = createPostDto.content.match(/#[^\s#]*/g);
    if (hashtag) {
      const result = await Promise.all(
        hashtag.map(async (tag) => {
          const ex = await this.db
            .select()
            .from(hashtags)
            .where(eq(hashtags.title, tag.slice(1).toLowerCase()))
            .limit(1);
          if (ex.length) {
            return ex[0];
          }
          await this.db.insert(hashtags).values({
            title: tag.slice(1).toLowerCase(),
          });
          const newHashtags = await this.db
            .select()
            .from(hashtags)
            .where(eq(hashtags.title, tag.slice(1).toLowerCase()))
            .limit(1);
          return newHashtags[0];
        }),
      );
      await this.db.insert(postsToHashtags).values(
        result.map((h) => ({
          postId: postId,
          hashtagId: h.id,
        })),
      );
    }

    // 게시글 생성 이벤트 발행
    this.eventEmitter.emit('post.created', {
      postId,
      userId,
      content: createPostDto.content,
      createdAt: new Date(),
    });

    return { postId, ...createPostDto, userId };
  }
}
