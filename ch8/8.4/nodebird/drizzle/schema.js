"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.follows = exports.postsToHashtags = exports.hashtags = exports.posts = exports.users = void 0;
const mysql_core_1 = require("drizzle-orm/mysql-core");
const drizzle_orm_1 = require("drizzle-orm");
exports.users = (0, mysql_core_1.mysqlTable)('users', {
    id: (0, mysql_core_1.varchar)({ length: 40 }).notNull(),
    nick: (0, mysql_core_1.varchar)({ length: 15 }).notNull(),
    password: (0, mysql_core_1.varchar)({ length: 100 }),
    provider: (0, mysql_core_1.mysqlEnum)(['local', 'kakao']).default('local').notNull(),
    createdAt: (0, mysql_core_1.datetime)('created_at', { mode: 'string' }).default((0, drizzle_orm_1.sql) `(CURRENT_TIMESTAMP)`).notNull(),
    updatedAt: (0, mysql_core_1.datetime)('updated_at', { mode: 'string' }).default((0, drizzle_orm_1.sql) `(CURRENT_TIMESTAMP)`).notNull(),
    deletedAt: (0, mysql_core_1.datetime)('deleted_at', { mode: 'string' }),
}, (table) => [
    (0, mysql_core_1.primaryKey)({ columns: [table.id], name: 'users_id' }),
]);
exports.posts = (0, mysql_core_1.mysqlTable)('posts', {
    id: (0, mysql_core_1.int)().autoincrement().notNull(),
    userId: (0, mysql_core_1.varchar)('user_id', { length: 40 }).notNull().references(() => exports.users.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
    content: (0, mysql_core_1.varchar)({ length: 140 }).notNull(),
    img: (0, mysql_core_1.varchar)({ length: 200 }),
    createdAt: (0, mysql_core_1.datetime)('created_at', { mode: 'string' }).default((0, drizzle_orm_1.sql) `(CURRENT_TIMESTAMP)`).notNull(),
    updatedAt: (0, mysql_core_1.datetime)('updated_at', { mode: 'string' }).default((0, drizzle_orm_1.sql) `(CURRENT_TIMESTAMP)`).notNull(),
    deletedAt: (0, mysql_core_1.datetime)('deleted_at', { mode: 'string' }),
}, (table) => [
    (0, mysql_core_1.index)('user_id_idx').on(table.userId),
    (0, mysql_core_1.primaryKey)({ columns: [table.id], name: 'posts_id' }),
]);
exports.hashtags = (0, mysql_core_1.mysqlTable)('hashtags', {
    id: (0, mysql_core_1.int)().autoincrement().notNull(),
    title: (0, mysql_core_1.varchar)({ length: 15 }).notNull().unique(),
    createdAt: (0, mysql_core_1.datetime)('created_at', { mode: 'string' }).default((0, drizzle_orm_1.sql) `(CURRENT_TIMESTAMP)`).notNull(),
}, (table) => [
    (0, mysql_core_1.primaryKey)({ columns: [table.id], name: 'hashtags_id' }),
]);
exports.postsToHashtags = (0, mysql_core_1.mysqlTable)('posts_to_hashtags', {
    postId: (0, mysql_core_1.int)('post_id')
        .notNull()
        .references(() => exports.posts.id, { onDelete: 'cascade' }),
    hashtagId: (0, mysql_core_1.int)('hashtag_id')
        .notNull()
        .references(() => exports.hashtags.id, { onDelete: 'cascade' }),
}, (table) => [
    (0, mysql_core_1.primaryKey)({ columns: [table.postId, table.hashtagId] }),
]);
exports.follows = (0, mysql_core_1.mysqlTable)('follows', {
    followerId: (0, mysql_core_1.varchar)('follower_id', { length: 40 })
        .notNull()
        .references(() => exports.users.id, { onDelete: 'cascade' }),
    followingId: (0, mysql_core_1.varchar)('following_id', { length: 40 })
        .notNull()
        .references(() => exports.users.id, { onDelete: 'cascade' }),
}, (table) => [
    (0, mysql_core_1.primaryKey)({ columns: [table.followerId, table.followingId] }),
]);
