const passport = require('passport');
const local = require('./localStrategy');
const kakao = require('./kakaoStrategy');
const db = require('../drizzle/connection');
const { eq, getTableColumns } = require('drizzle-orm');
const { users } = require('../drizzle/schema');

module.exports = () => {
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const { password, ...rest } = getTableColumns(users);
      const user = await db.select({
        ...rest,
      })
      .from(users)
      .where(eq(users.id, id));
      done(null, user[0]);
    } catch (error) {
      console.error(error);
      done(error);
    }
  });

  local();
  kakao();
};
