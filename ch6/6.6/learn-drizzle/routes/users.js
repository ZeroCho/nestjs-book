const express = require('express');
const db = require('../drizzle/connection');
const { users: usersTable, comments: commentsTable } = require('../drizzle/schema');
const { eq } = require('drizzle-orm');
const router = express.Router();

router.route('/')
  .get(async (req, res, next) => {
    try {
      const users = await db.select().from(usersTable);
      res.json(users);
    } catch (err) {
      console.error(err);
      next(err);
    }
  })
  .post(async (req, res, next) => {
    try {
      await db.insert(usersTable)
        .values({
          name: req.body.name,
          age: req.body.age,
          married: req.body.married,
        });
      res.status(201).send('ok');
    } catch (err) {
      console.error(err);
      next(err);
    }
  });

router.get('/:id/comments', async (req, res, next) => {
  try {
    const comments = await db.query.comments.findMany({
      with: { 
        user: {
          columns: {
            name: true,
          },
        },
      },
      where: eq(commentsTable.commenter, req.params.id),
    });
    console.log(comments);
    res.json(comments);
  } catch (err) {
    console.error(err);
    next(err);
  }
});

module.exports = router;
