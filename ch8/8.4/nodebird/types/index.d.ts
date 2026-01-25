import { InferSelectModel } from "drizzle-orm";
import { users } from "../drizzle/schema";

declare global {
  interface Error {
    status?: number;
  }

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

  namespace Express {
    interface User extends DrizzleUser {}
  }
}
