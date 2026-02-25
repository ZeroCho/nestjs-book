import { Injectable, Inject } from '@nestjs/common';
import { users } from '../drizzle/schema';
import { eq } from 'drizzle-orm';
import * as bcrypt from 'bcrypt';
import { MySql2Database } from 'drizzle-orm/mysql2';
import * as schema from '../drizzle/schema';
import { JoinDto } from './dto/join.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class AuthService {
  constructor(
    @Inject('DRIZZLE')
    private readonly db: MySql2Database<typeof schema>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async join(body: JoinDto) {
    const { id, nick, password } = body;
    const exUser = await this.db.select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    if (exUser.length) {
      throw new Error('already_exist');
    }
    const hash = await bcrypt.hash(password, 12);
    await this.db.insert(users).values({
      id,
      nick,
      password: hash,
    });

    // 사용자 생성 이벤트 발행
    this.eventEmitter.emit('user.created', {
      userId: id,
      name: nick,
      createdAt: new Date(),
    });
  }
}
