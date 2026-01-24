const { mysqlTable, boolean, index, primaryKey, int, varchar, datetime, unique, text } = require("drizzle-orm/mysql-core");
const { sql } = require("drizzle-orm");


exports.comments = mysqlTable("comments", {
  id: int().autoincrement().notNull(),
  commenter: int().notNull().references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" } ),
  comment: varchar({ length: 100 }).notNull(),
  createdAt: datetime("created_at", { mode: 'string'}).default(sql`(CURRENT_TIMESTAMP)`).notNull(),
},
(table) => [
  index("commenter_idx").on(table.commenter),
  primaryKey({ columns: [table.id], name: "comments_id"}),
]);


exports.users = mysqlTable("users", {
  id: int().autoincrement().notNull(),
  name: varchar({ length: 20 }).notNull(),
  age: int({ unsigned: true }).notNull(),
  married: boolean().notNull(),
  comment: text(),
  createdAt: datetime("created_at", { mode: 'string'}).default(sql`(CURRENT_TIMESTAMP)`).notNull(),
},
(table) => [
  primaryKey({ columns: [table.id], name: "users_id"}),
  unique("name_UNIQUE").on(table.name),
]);
