const passport = require('passport');
const { Strategy: LocalStrategy } = require('passport-local');
const bcrypt = require('bcrypt');
const db = require('../drizzle/connection');
const { eq } = require('drizzle-orm');
const { users } = require('../drizzle/schema');

module.exports = () => {
  passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
  }, async (email, password, done) => {
    try {
      const exUser = await db.select()
        .from(users)
        .where(eq(users.id, email))
        .limit(1);
      if (exUser.length) {
        const result = await bcrypt.compare(password, exUser[0].password);
        if (result) {
          done(null, exUser[0]);
        } else {
          done(null, false, { message: '비밀번호가 일치하지 않습니다.' });
        }
      } else {
        done(null, false, { message: '가입되지 않은 회원입니다.' });
      }
    } catch (error) {
      console.error(error);
      done(error);
    }
  }));
};
