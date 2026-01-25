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
      const user = await db.query.users.findFirst({
        where: eq(users.id, id),
        columns: {
          password: false,
        },
        with: {
          followers: {
            with: {
              follower: {
                columns: {
                  id: true,
                  nick: true,
                }
              },
            }
          },
          followings: {
            with: {
              following: {
                columns: {
                  id: true,
                  nick: true,
                }
              }
            }
          },
        }
      })
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  local();
  kakao();
};
