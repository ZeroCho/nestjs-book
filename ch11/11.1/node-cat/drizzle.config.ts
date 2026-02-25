import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'mysql',
  schema: './src/drizzle/schema.ts',
  out: './src/drizzle',
  dbCredentials: {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: process.env.DB_PASSWORD,
    database: 'nodebird',
  },
});
