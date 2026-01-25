const bcrypt = require('bcrypt');
const passport = require('passport');
const db = require('../drizzle/connection');
const { eq } = require('drizzle-orm');
const { users } = require('../drizzle/schema');

const join = async (req, res, next) => {
  const { email, nick, password } = req.body;
  try {
    const exUser = await db.select()
      .from(users)
      .where(eq(users.id, email))
      .limit(1);
    if (exUser.length) {
      return res.redirect('/join?error=exist');
    }
    const hash = await bcrypt.hash(password, 12);
    await db.insert(users).values({
      id: email,
      nick,
      password: hash,
    });
    return res.redirect('/');
  } catch (error) {
    console.error(error);
    return next(error);
  }
};

const login = (req, res, next) => {
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
  })(req, res, next);
};

const logout = (req, res) => {
  req.logout(() => {
    res.redirect('/');
  });
};

module.exports = { join, login, logout };
