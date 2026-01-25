import express from 'express';
import { isLoggedIn, isNotLoggedIn } from '../middlewares';
import {
  renderProfile, renderJoin, renderMain, renderHashtag,
} from '../controllers/page';

const router = express.Router();

router.use((req, res, next) => {
  res.locals.user = req.user;
  res.locals.followerCount = req.user?.followers?.length || 0;
  res.locals.followingCount = req.user?.followings?.length || 0;
  res.locals.followingIdList = req.user?.followings?.map(f => f.following.id) || [];
  next();
});

router.get('/profile', isLoggedIn, renderProfile);
router.get('/join', isNotLoggedIn, renderJoin);
router.get('/', renderMain);
router.get('/search', renderHashtag);

export default router;
