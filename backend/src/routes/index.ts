import express from 'express';
import authRouter from './auth';
import usersRouter from './users';
import tripsRouter from './trips';
import employer from './employer';

const router = express.Router();

router.use('/auth', authRouter);
router.use('/user', usersRouter);
router.use('/trip', tripsRouter);
router.use('/employer', employer);

export default router;
