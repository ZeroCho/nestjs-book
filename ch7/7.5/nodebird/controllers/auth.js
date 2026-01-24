const bcrypt = require('bcrypt');
const passport = require('passport');
const db = require('../drizzle/connection');
const { eq } = require('drizzle-orm');
const { users } = require('../drizzle/schema');

exports.join = async (req, res, next) => {
  const { id, nick, password } = req.body;
  try {
    const exUser = await db.select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    if (exUser.length) {
      return res.redirect('/join?error=exist');
    }
    const hash = await bcrypt.hash(password, 12);
    await db.insert(users).values({
      id,
      nick,
      password: hash,
    });
    return res.redirect('/');
  } catch (error) {
    console.error(error);
    return next(error);
  }
}

exports.login = (req, res, next) => {
  passport.authenticate('local', (authError, user, info) => {
    if (authError) {
      console.error(authError);
      return next(authError);
    }
    if (!user) {
      return res.redirect(`/?loginError=${info.message}`);
    }
    return req.login(user, (loginError) => {
      if (loginError) {
        console.error(loginError);
        return next(loginError);
      }
      return res.redirect('/');
    });
  })(req, res, next); // 미들웨어 내의 미들웨어에는 (req, res, next)를 붙입니다
};

exports.logout = (req, res) => {
  req.logout(() => {
    res.redirect('/');
  });
};
