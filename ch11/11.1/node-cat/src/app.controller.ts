import { Controller, Get, Res, UseGuards, Inject, Query, Render, UseInterceptors } from '@nestjs/common';
import { RenderInterceptor } from './render/render.interceptor';
import type { Response } from 'express';
import { IsLoggedInGuard } from './auth/is-logged-in.guard';
import { IsNotLoggedInGuard } from './auth/is-not-logged-in.guard';
import { posts, hashtags, postsToHashtags, users } from 'src/drizzle/schema';
import * as schema from 'src/drizzle/schema';
import { desc, eq } from 'drizzle-orm';
import { MySql2Database } from 'drizzle-orm/mysql2';

@UseInterceptors(RenderInterceptor)
@Controller()
export class AppController {
  constructor(
    @Inject('DRIZZLE')
    private readonly db: MySql2Database<typeof schema>,
  ) {
    console.log('AppController constructor');
  }

  @UseGuards(IsLoggedInGuard)
  @Render('profile')
  @Get('profile')
  renderProfile() {
    return { title: '내 정보 - NodeBird' };
  }

  @UseGuards(IsNotLoggedInGuard)
  @Render('join')
  @Get('join')
  renderJoin() {
    return { title: '회원가입 - NodeBird' };
  }

  @Render('main')
  @Get()
  async renderMain() {
    const twits = await this.db.query.posts.findMany({
      with: {
        user: {
          columns: {
            id: true,
            nick: true,
          },
        },
      },
      orderBy: [desc(posts.createdAt)],
    })
    return {
      title: 'NodeBird',
      twits,
    };
  }

  @Render('main')
  @Get('search')
  async renderSearch(@Res() res: Response, @Query('hashtag') query: string) {
    if (!query) {
      return res.redirect('/');
    }
    const result = await this.db
      .select({ posts, user: { id: users.id, nick: users.nick } })
      .from(posts)
      .innerJoin(postsToHashtags, eq(posts.id, postsToHashtags.postId))
      .innerJoin(hashtags, eq(hashtags.id, postsToHashtags.hashtagId))
      .innerJoin(users, eq(posts.userId, users.id))
      .where(eq(hashtags.title, query))
      .orderBy(desc(posts.createdAt));

    return {
      title: `${query} | NodeBird`,
      twits: result.map(row => ({ ...row.posts, user: row.user })),
    };
  }
}
