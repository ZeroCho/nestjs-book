import { InferSelectModel } from "drizzle-orm";
import { users } from "../drizzle/schema";

declare global {
  interface Error {
    status?: number;
  }

  type DrizzleUser = Omit<InferSelectModel<typeof users>, 'password'>;

  namespace Express {
    interface User extends DrizzleUser {}
  }
}
