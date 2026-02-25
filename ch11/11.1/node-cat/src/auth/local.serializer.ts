import { Inject, Injectable } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';
import { MySql2Database } from 'drizzle-orm/mysql2';
import * as schema from '../drizzle/schema';
import { eq, getTableColumns } from 'drizzle-orm';

@Injectable()
export class LocalSerializer extends PassportSerializer {
  constructor(
    @Inject('DRIZZLE')
    private readonly db: MySql2Database<typeof schema>,
  ) {
    super();
  }

  serializeUser(user: { id: string }, done: CallableFunction) {
    done(null, user.id);
  }

  async deserializeUser(id: string, done: CallableFunction) {
    try {
      const { password, ...rest } = getTableColumns(schema.users);
      const user = await this.db.select({
        ...rest,
      })
        .from(schema.users)
        .where(eq(schema.users.id, id));
      done(null, user[0]);
    } catch (error) {
      console.error(error);
      done(error);
    }
  }
}
