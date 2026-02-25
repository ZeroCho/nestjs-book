import { InferSelectModel } from 'drizzle-orm';
import { users } from '../src/drizzle/schema';

type DrizzleUser = Omit<InferSelectModel<typeof users>, 'password'> & {
  followers?: {
    follower: {
      id: string;
      nick: string;
    };
  }[];
  followings?: {
    following: {
      id: string;
      nick: string;
    };
  }[];
};

declare global {
  namespace Express {
    interface User extends DrizzleUser {}
  }
}

declare module 'express-session' {
  interface SessionData {
    passport?: {
      user?: DrizzleUser;
    };
  }
}
