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
      const { password, ...rest } = getTableColumns(users);
      const user = await db.query.users.findFirst({
        columns: rest,
        where: eq(users.id, id),
        with: {
          followers: {
            columns: {},
            with: {
              follower: {
                columns: {
                  id: true,
                  nick: true,
                },
              },
            },
          },
          followings: {
            columns: {},
            with: {
              following: {
                columns: {
                  id: true,
                  nick: true,
                },
              },
            },
          },
        },
      });
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  local();
  kakao();
};
