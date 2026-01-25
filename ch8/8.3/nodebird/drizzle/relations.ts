import { relations } from 'drizzle-orm/relations';
import { users, posts, hashtags, postsToHashtags, follows } from './schema';

export const postsRelations = relations(posts, ({ one, many }) => ({
  user: one(users, {
    fields: [posts.userId],
    references: [users.id],
  }),
  postsToHashtags: many(postsToHashtags),
}));

export const hashtagRelations = relations(hashtags, ({ many }) => ({
  postsToHashtags: many(postsToHashtags),
}));

export const postsToHashtagsRelations = relations(postsToHashtags, ({ one }) => ({
  post: one(posts, {
    fields: [postsToHashtags.postId],
    references: [posts.id],
  }),
  hashtag: one(hashtags, {
    fields: [postsToHashtags.hashtagId],
    references: [hashtags.id],
  }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
  followers: many(follows, { relationName: 'followings' }),
  followings: many(follows, { relationName: 'followers' }),
}));

export const followsRelations = relations(follows, ({ one }) => ({
  follower: one(users, {
    fields: [follows.followerId],
    references: [users.id],
    relationName: 'followers',
  }),
  following: one(users, {
    fields: [follows.followingId],
    references: [users.id],
    relationName: 'followings',
  }),
}));
