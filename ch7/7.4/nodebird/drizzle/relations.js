const { relations } = require("drizzle-orm/relations");
const { users, posts, hashtags, postsToHashtags, follows } = require("./schema");

exports.postsRelations = relations(posts, ({one, many}) => ({
  user: one(users, {
    fields: [posts.userId],
    references: [users.id]
  }),
  postsToHashtags: many(postsToHashtags),
}));

exports.hashtagRelations = relations(hashtags, ({many}) => ({
  postsToHashtags: many(postsToHashtags),
}));

exports.postsToHashtagsRelations = relations(postsToHashtags, ({many}) => ({
  post: many(posts),
  hashtag: many(hashtags),
}));

exports.usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
  // 내가 팔로우한 사람들
  followings: many(follows, {
    relationName: 'followers',
  }),
  // 나를 팔로우한 사람들
  followers: many(follows, {
    relationName: 'followings',
  }),
}));

exports.followsRelations = relations(follows, ({ one }) => ({
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
