import { type RequestHandler } from 'express';
import db from '../drizzle/connection';
import { posts, hashtags, postsToHashtags } from '../drizzle/schema';
import { eq } from 'drizzle-orm';

const afterUploadImage: RequestHandler = (req, res) => {
  console.log(req.file);
  res.json({ url: `/img/${req.file?.filename}` });
};

const uploadPost: RequestHandler = async (req, res, next) => {
  try {
    await db.insert(posts).values({
      content: req.body.content,
      img: req.body.url,
      userId: req.user!.id,
    });
    const result = await db.execute('SELECT LAST_INSERT_ID() as insertId');
    const insertId = (result[0] as unknown as { insertId: number }[])[0]?.insertId;
    const hashtag: string[] = req.body.content.match(/#[^\s#]*/g);
    if (insertId && hashtag) {
      const result = await Promise.all(
        hashtag.map(async (tag) => {
          const title = tag.slice(1).toLowerCase();
          const exHashtag = await db.select()
            .from(hashtags)
            .where(eq(hashtags.title, title))
            .limit(1);
          if (exHashtag.length) {
            return exHashtag[0];
          }
          await db.insert(hashtags).values({ title });
          const newHashtag = await db.select()
            .from(hashtags)
            .where(eq(hashtags.title, title))
            .limit(1);
          return newHashtag[0];
        }),
      );
      await db.insert(postsToHashtags).values(
        result.map((h) => ({
          postId: insertId,
          hashtagId: h!.id,
        })),
      );
    }
    res.redirect('/');
  } catch (error) {
    console.error(error);
    next(error);
  }
};

export { afterUploadImage, uploadPost };
