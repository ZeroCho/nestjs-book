import { InferSelectModel } from 'drizzle-orm';
import { users } from '../src/drizzle/schema';

type DrizzleUser = InferSelectModel<typeof users>;

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
