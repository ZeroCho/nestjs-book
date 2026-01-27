import { mysqlTable, varchar, text, timestamp, int, primaryKey } from 'drizzle-orm/mysql-core';

export const users = mysqlTable('users', {
  id: varchar('id', { length: 50 }).primaryKey(),
  nick: varchar('nick', { length: 50 }).notNull(),
  password: varchar('password', { length: 100 }),
  provider: varchar('provider', { length: 20 }).default('local'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

export const posts = mysqlTable('posts', {
  id: int('id').primaryKey().autoincrement(),
  content: text('content').notNull(),
  img: varchar('img', { length: 255 }),
  userId: varchar('user_id', { length: 50 }).references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

export const hashtags = mysqlTable('hashtags', {
  id: int('id').primaryKey().autoincrement(),
  title: varchar('title', { length: 50 }).notNull().unique(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

export const postsToHashtags = mysqlTable('posts_to_hashtags', {
  postId: int('post_id').references(() => posts.id),
  hashtagId: int('hashtag_id').references(() => hashtags.id),
}, (table) => ({
  pk: primaryKey({ columns: [table.postId, table.hashtagId] }),
}));

export const follows = mysqlTable('follows', {
  followerId: varchar('follower_id', { length: 50 }).references(() => users.id),
  followingId: varchar('following_id', { length: 50 }).references(() => users.id),
}, (table) => ({
  pk: primaryKey({ columns: [table.followerId, table.followingId] }),
}));
