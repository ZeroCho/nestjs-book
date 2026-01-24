const express = require('express');
const db = require('../drizzle/connection');
const { comments: commentsTable } = require('../drizzle/schema');
const { eq } = require('drizzle-orm');

const router = express.Router();

router.post('/', async (req, res, next) => {
  try {
    await db.insert(commentsTable).values({
      commenter: req.body.id,
      comment: req.body.comment,
    });
    res.status(201).send('ok');
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.route('/:id')
  .patch(async (req, res, next) => {
    try {
      const result = await db.update(commentsTable)
        .set({
          comment: req.body.comment,
        })
        .where(eq(commentsTable.id, req.params.id));
      res.json(result);
    } catch (err) {
      console.error(err);
      next(err);
    }
  })
  .delete(async (req, res, next) => {
    try {
      const result = await db.delete(commentsTable)
        .where(eq(commentsTable.id, req.params.id));
      res.json(result);
    } catch (err) {
      console.error(err);
      next(err);
    }
  });

module.exports = router;
