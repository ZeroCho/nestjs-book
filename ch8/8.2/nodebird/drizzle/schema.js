const { mysqlTable, mysqlEnum, index, primaryKey, int, varchar, datetime } = require('drizzle-orm/mysql-core');
const { sql } = require('drizzle-orm');

const users = mysqlTable('users', {
  id: varchar({ length: 40 }).notNull(),
  nick: varchar({ length: 15 }).notNull(),
  password: varchar({ length: 100 }),
  provider: mysqlEnum(['local', 'kakao']).default('local').notNull(),
  createdAt: datetime('created_at', { mode: 'string' }).default(sql`(CURRENT_TIMESTAMP)`).notNull(),
  updatedAt: datetime('updated_at', { mode: 'string' }).default(sql`(CURRENT_TIMESTAMP)`).notNull(),
  deletedAt: datetime('deleted_at', { mode: 'string' }),
},
(table) => [
  primaryKey({ columns: [table.id], name: 'users_id' }),
]);

const posts = mysqlTable('posts', {
  id: int().autoincrement().notNull(),
  userId: varchar('user_id', { length: 40 }).notNull().references(() => users.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  content: varchar({ length: 140 }).notNull(),
  img: varchar({ length: 200 }),
  createdAt: datetime('created_at', { mode: 'string' }).default(sql`(CURRENT_TIMESTAMP)`).notNull(),
  updatedAt: datetime('updated_at', { mode: 'string' }).default(sql`(CURRENT_TIMESTAMP)`).notNull(),
  deletedAt: datetime('deleted_at', { mode: 'string' }),
},
(table) => [
  index('user_id_idx').on(table.userId),
  primaryKey({ columns: [table.id], name: 'posts_id' }),
]);

const hashtags = mysqlTable('hashtags', {
  id: int().autoincrement().notNull(),
  title: varchar({ length: 15 }).notNull().unique(),
  createdAt: datetime('created_at', { mode: 'string' }).default(sql`(CURRENT_TIMESTAMP)`).notNull(),
},
(table) => [
  primaryKey({ columns: [table.id], name: 'hashtags_id' }),
]);

const postsToHashtags = mysqlTable('posts_to_hashtags', {
  postId: int('post_id')
    .notNull()
    .references(() => posts.id, { onDelete: 'cascade' }),
  hashtagId: int('hashtag_id')
    .notNull()
    .references(() => hashtags.id, { onDelete: 'cascade' }),
},
(table) => [
  primaryKey({ columns: [table.postId, table.hashtagId] }),
]);

const follows = mysqlTable('follows',
  {
    followerId: varchar('follower_id', { length: 40 })
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    followingId: varchar('following_id', { length: 40 })
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
  },
  (table) => [
    primaryKey({ columns: [table.followerId, table.followingId] }),
  ]);

module.exports = { users, posts, hashtags, postsToHashtags, follows };
