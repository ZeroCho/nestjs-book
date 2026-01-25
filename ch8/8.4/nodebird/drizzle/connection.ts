import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from './schema';
import * as relations from './relations';

const poolConnection = mysql.createPool({
  user: 'root',
  password: process.env.DB_PASSWORD!,
  host: 'localhost',
  port: 3306,
  database: 'nodebird',
  connectionLimit: 10,
});

export default drizzle({ client: poolConnection, schema: { ...schema, ...relations }, mode: 'default' });
