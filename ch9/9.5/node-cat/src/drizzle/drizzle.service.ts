import { Injectable } from '@nestjs/common';
import mysql, { PoolOptions } from 'mysql2';
import { drizzle, MySql2DrizzleConfig } from 'drizzle-orm/mysql2';

export interface DrizzleMySqlConfig {
  mysql: PoolOptions;
  config: MySql2DrizzleConfig<any>;
}

@Injectable()
export class DrizzleMySqlService {
  public getDrizzle(options: DrizzleMySqlConfig) {
    const pool = mysql.createPool(options.mysql);
    return drizzle(pool, options.config);
  }
}
