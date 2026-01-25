import { type RequestHandler } from 'express';
import db from '../drizzle/connection';
import { follows, users } from '../drizzle/schema';
import { eq } from 'drizzle-orm';

const follow: RequestHandler = async (req, res, next) => {
  try {
    if (typeof req.params.id !== 'string') {
      return res.status(400).send('id_must_be_string');
    }
    const user = await db.select()
      .from(users)
      .where(eq(users.id, req.user!.id))
      .limit(1);
    if (user.length) {
      await db.insert(follows).values({
        followerId: req.user!.id,
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

export { follow };
