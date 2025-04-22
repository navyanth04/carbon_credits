import express from 'express';
import authRouter from './auth';
import usersRouter from './users';
import tripsRouter from './trips';
import employer from './employer';
import adminRouter from './admin';
import tradeRouter from './trade';

const router = express.Router();

router.use('/auth', authRouter);
router.use('/user', usersRouter);
router.use('/trip', tripsRouter);
router.use('/employer', employer);
router.use('/admin',adminRouter);
router.use('/trades',tradeRouter)

export default router;
