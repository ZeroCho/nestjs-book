import { UnauthorizedException, Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';
import { MySql2Database } from 'drizzle-orm/mysql2';
import * as schema from '../drizzle/schema';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject('DRIZZLE')
    private readonly db: MySql2Database<typeof schema>
  ) {
    super({
      usernameField: 'id',
      passwordField: 'password',
      passReqToCallback: false,
    });
  }

  async validate(id: string, password: string) {
    try {
      const exUser = await this.db.select()
        .from(schema.users)
        .where(eq(schema.users.id, id))
        .limit(1);
      if (exUser.length && exUser[0].password) {
        const result = await bcrypt.compare(password, exUser[0].password);
        if (result) {
          return exUser[0];
        } else {
          throw new UnauthorizedException('비밀번호가 일치하지 않습니다.');
        }
      } else {
        throw new UnauthorizedException('가입되지 않은 회원입니다.');
      }
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(error);
    }
  }
}
