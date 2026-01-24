const express = require('express');
const db = require('../drizzle/connection');
const { users: usersTable } = require('../drizzle/schema');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const users = await db.select().from(usersTable);
    res.render('drizzle', { users });
  } catch (err) {
    console.error(err);
    next(err);
  }
});

module.exports = router;
