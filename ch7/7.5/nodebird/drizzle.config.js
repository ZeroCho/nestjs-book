import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "mysql",
  schema: './drizzle/schema.js', // 스키마 파일의 경로
  out: './drizzle', // 드리즐 관련 파일이 저장될 경로
  dbCredentials: {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: process.env.DB_PASSWORD,
    database: 'nodebird',
  },
});
