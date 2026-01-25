import express from 'express';
import { isLoggedIn } from '../middlewares';
import { follow } from '../controllers/user';

const router = express.Router();

router.post('/:id/follow', isLoggedIn, follow);

export default router;
