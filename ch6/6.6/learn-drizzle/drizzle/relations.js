const { relations } = require("drizzle-orm/relations");
const { users, comments } = require("./schema");

exports.commentsRelations = relations(comments, ({one}) => ({
  user: one(users, {
    fields: [comments.commenter],
    references: [users.id]
  }),
}));

exports.usersRelations = relations(users, ({many}) => ({
  comments: many(comments),
}));
