import passport from 'passport';
import local from './localStrategy';
import kakao from './kakaoStrategy';
import db from '../drizzle/connection';
import { eq, getTableColumns } from 'drizzle-orm';
import { users } from '../drizzle/schema';

export default () => {
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
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
