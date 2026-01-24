const { drizzle } = require("drizzle-orm/mysql2");
const mysql = require("mysql2/promise");
const schema = require("./schema");
const relations = require("./relations");

const poolConnection = mysql.createPool({
  user: "root",
  password: process.env.DB_PASSWORD,
  host: "localhost",
  port: 3306,
  database: "nodejs",
  connectionLimit: 10,
});


module.exports = drizzle({ client: poolConnection, schema: { ...schema, ...relations }, mode: "default" });
