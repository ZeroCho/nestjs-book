const db = require('../drizzle/connection');
const { follows, users } = require('../drizzle/schema');
const { eq } = require('drizzle-orm');

const follow = async (req, res, next) => {
  try {
    const user = await db.select()
      .from(users)
      .where(eq(users.id, req.user.id))
      .limit(1);
    if (user.length) {
      await db.insert(follows).values({
        followerId: req.user.id,
        followingId: req.params.id,
      });
      res.send('success');
    } else {
      res.status(404).send('no_user');
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
};

module.exports = { follow };
