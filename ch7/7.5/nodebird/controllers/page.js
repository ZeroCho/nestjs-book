const db = require('../drizzle/connection');
const { posts, hashtags, postsToHashtags, users } = require('../drizzle/schema');
const { desc, eq } = require('drizzle-orm');

exports.renderProfile = (req, res) => {
  res.render('profile', { title: '내 정보 - NodeBird' });
};

exports.renderJoin = (req, res) => {
  res.render('join', { title: '회원 가입 - NodeBird' });
};

exports.renderMain = async (req, res, next) => {
  try {
    const twits = await db.query.posts.findMany({
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
    res.render('main', {
      title: 'NodeBird',
      twits,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

exports.renderHashtag = async (req, res, next) => {
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
      .where(eq(hashtags.title, query))
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
