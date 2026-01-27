import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-kakao';
import { ConfigService } from '@nestjs/config';
import { eq, and } from 'drizzle-orm';
import { MySql2Database } from 'drizzle-orm/mysql2';
import * as schema from '../drizzle/schema';

@Injectable()
export class KakaoStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    @Inject('DRIZZLE')
    private readonly db: MySql2Database<typeof schema>,
  ) {
    super({
      clientID: configService.get('KAKAO_ID')!,
      callbackURL: '',
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: Profile) {
    try {
      const exUser = await this.db.select()
        .from(schema.users)
        .where(and(
          eq(schema.users.id, profile.id.toString()),
          eq(schema.users.provider, 'kakao'),
        ))
        .limit(1);
      if (exUser.length) {
        return exUser[0];
      } else {
        await this.db.insert(schema.users).values({
          id: profile.id.toString(),
          nick: profile.displayName,
          provider: 'kakao',
        });
        const newUser = await this.db.select()
          .from(schema.users)
          .where(eq(schema.users.id, profile.id.toString()))
          .limit(1);
        return newUser;
      }
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(error);
    }
  }
}
