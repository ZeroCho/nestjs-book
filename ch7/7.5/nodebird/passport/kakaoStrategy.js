const passport = require('passport');
const KakaoStrategy = require('passport-kakao').Strategy;
const db = require('../drizzle/connection');
const { eq, and } = require('drizzle-orm');
const { users } = require('../drizzle/schema');

module.exports = () => {
  passport.use(new KakaoStrategy({
    clientID: process.env.KAKAO_ID,
    callbackURL: '/auth/kakao/callback',
  }, async (accessToken, refreshToken, profile, done) => {
    console.log('kakao profile', profile);
    try {
      const exUser = await db.select()
        .from(users)
        .where(and(
          eq(users.id, profile.id.toString()),
          eq(users.provider, 'kakao'),
        ))
        .limit(1);
      if (exUser.length) {
        done(null, exUser[0]);
      } else {
        await db.insert(users).values({
          id: profile.id.toString(),
          nick: profile.displayName,
          provider: 'kakao',
        });
        const newUser = await db.select()
          .from(users)
          .where(eq(users.id, profile.id.toString()))
          .limit(1);
        done(null, newUser[0]);
      }
    } catch (error) {
      console.error(error);
      done(error);
    }
  }));
};
