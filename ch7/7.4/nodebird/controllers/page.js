const db = require('../drizzle/connection');
const { posts } = require('../drizzle/schema');
const { desc } = require('drizzle-orm');

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
