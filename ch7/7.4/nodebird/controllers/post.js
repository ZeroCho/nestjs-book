const db = require('../drizzle/connection');
const { posts, hashtags, postsToHashtags } = require('../drizzle/schema');
const { eq } = require('drizzle-orm');

exports.afterUploadImage = (req, res) => {
  console.log(req.file);
  res.json({ url: `/img/${req.file.filename}` });
};

exports.uploadPost = async (req, res, next) => {
  try {
    await db.insert(posts).values({
      content: req.body.content,
      img: req.body.url,
      userId: req.user.id,
    });
    const result = await db.execute('SELECT LAST_INSERT_ID() as insertId');
    const insertId = result[0][0].insertId;
    const hashtag = req.body.content.match(/#[^\s#]*/g);
    if (hashtag) {
      const result = await Promise.all(
        hashtag.map(async (tag) => {
          const ex = await db.select()
            .from(hashtags)
            .where(eq(hashtags.title, tag.slice(1).toLowerCase()))
            .limit(1);
          if (ex.length) {
            return ex[0];
          }
          await db.insert(hashtags).values({
            title: tag.slice(1).toLowerCase(),
          });
          const newHashtags = await db.select()
            .from(hashtags)
            .where(eq(hashtags.title, tag.slice(1).toLowerCase()))
            .limit(1);
          return newHashtags[0];
        }),
      );
      await db.insert(postsToHashtags).values(
        result.map((hashtag) => ({
          postId: insertId,
          hashtagId: hashtag.id,
        })),
      );
    }
    res.redirect('/');
  } catch (error) {
    console.error(error);
    next(error);
  }
};
