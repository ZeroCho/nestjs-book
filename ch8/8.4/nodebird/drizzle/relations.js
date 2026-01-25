"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.followsRelations = exports.usersRelations = exports.postsToHashtagsRelations = exports.hashtagRelations = exports.postsRelations = void 0;
const relations_1 = require("drizzle-orm/relations");
const schema_1 = require("./schema");
exports.postsRelations = (0, relations_1.relations)(schema_1.posts, ({ one, many }) => ({
    user: one(schema_1.users, {
        fields: [schema_1.posts.userId],
        references: [schema_1.users.id],
    }),
    postsToHashtags: many(schema_1.postsToHashtags),
}));
exports.hashtagRelations = (0, relations_1.relations)(schema_1.hashtags, ({ many }) => ({
    postsToHashtags: many(schema_1.postsToHashtags),
}));
exports.postsToHashtagsRelations = (0, relations_1.relations)(schema_1.postsToHashtags, ({ one }) => ({
    post: one(schema_1.posts, {
        fields: [schema_1.postsToHashtags.postId],
        references: [schema_1.posts.id],
    }),
    hashtag: one(schema_1.hashtags, {
        fields: [schema_1.postsToHashtags.hashtagId],
        references: [schema_1.hashtags.id],
    }),
}));
exports.usersRelations = (0, relations_1.relations)(schema_1.users, ({ many }) => ({
    posts: many(schema_1.posts),
    followers: many(schema_1.follows, { relationName: 'followings' }),
    followings: many(schema_1.follows, { relationName: 'followers' }),
}));
exports.followsRelations = (0, relations_1.relations)(schema_1.follows, ({ one }) => ({
    follower: one(schema_1.users, {
        fields: [schema_1.follows.followerId],
        references: [schema_1.users.id],
        relationName: 'followers',
    }),
    following: one(schema_1.users, {
        fields: [schema_1.follows.followingId],
        references: [schema_1.users.id],
        relationName: 'followings',
    }),
}));
