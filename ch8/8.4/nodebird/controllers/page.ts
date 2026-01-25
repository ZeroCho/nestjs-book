import { type RequestHandler } from 'express';
import db from '../drizzle/connection';
import { users, posts, hashtags, postsToHashtags } from '../drizzle/schema';
import { eq, desc } from 'drizzle-orm';

const renderProfile: RequestHandler = (req, res) => {
  res.render('profile', { title: '내 정보 - NodeBird' });
};

const renderJoin: RequestHandler = (req, res) => {
  res.render('join', { title: '회원 가입 - NodeBird' });
};

const renderMain: RequestHandler = async (req, res, next) => {
  try {
    const twits = await db.query.posts.findMany({
      with: {
        user: true,
      },
      orderBy: (posts) => desc(posts.createdAt),
    });
    res.render('main', {
      title: 'NodeBird',
      twits,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

const renderHashtag: RequestHandler = async (req, res, next) => {
  const query = req.query.hashtag;
  if (!query) {
    return res.redirect('/');
  }
  try {
    const result = await db
      .select({ posts, user: { id: users.id, nick: users.nick } })
      .from(posts)
      .innerJoin(postsToHashtags, eq(posts.id, postsToHashtags.postId))
      .innerJoin(hashtags, eq(hashtags.id, postsToHashtags.hashtagId))
      .innerJoin(users, eq(posts.userId, users.id))
      .where(eq(hashtags.title, query as string))
      .orderBy(desc(posts.createdAt));
    return res.render('main', {
      title: `${query} | NodeBird`,
      twits: result.map(row => ({ ...row.posts, user: row.user })),
    });
  } catch (error) {
    console.error(error);
    return next(error);
  }
};

export { renderHashtag, renderProfile, renderMain, renderJoin };
