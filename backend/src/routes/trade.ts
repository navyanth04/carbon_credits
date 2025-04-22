// src/routes/trades.ts
import express from 'express';
import { Response } from 'express';
import { authMiddleware } from '../middleware/middleware';
import CustomRequest from '../interfaces/interface';
import { PrismaClient, TradeStatus } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// 1) Propose a new trade (must be EMPLOYER)
router.post('/', authMiddleware, async (req: CustomRequest, res: Response): Promise<any> => {
  const { toEmployerId, credits, pricePerCredit, description } = req.body;
  const me = await prisma.user.findUnique({ where: { email: req.email! } });
  if (!me || me.role !== 'EMPLOYER') return res.sendStatus(403);

  const totalPrice = credits * pricePerCredit;
  const trade = await prisma.trade.create({
    data: {
      fromEmployerId: me.employerId!,
      toEmployerId,
      credits,
      pricePerCredit,
      totalPrice,
      description,
    },
  });

  res.status(201).json({ trade });
});

// 2) List my org’s incoming & outgoing trades
router.get('/my', authMiddleware, async (req: CustomRequest, res: Response): Promise<any> => {
  const me = await prisma.user.findUnique({ where: { email: req.email! } });
  if (!me) return res.sendStatus(404);

  const trades = await prisma.trade.findMany({
    where: {
      OR: [
        { fromEmployerId: me.employerId! },
        { toEmployerId: me.employerId! },
      ],
    },
    include: { fromEmployer: true, toEmployer: true },
    orderBy: { tradeDate: 'desc' },
  });

  res.status(200).json({ trades });
});

// 3) Admin: list all pending trades
router.get('/pending', authMiddleware, async (req: CustomRequest, res: Response): Promise<any> => {
  const me = await prisma.user.findUnique({ where: { email: req.email! } });
  if (!me || me.role !== 'ADMIN') return res.sendStatus(403);

  const trades = await prisma.trade.findMany({
    where: { status: TradeStatus.PENDING },
    include: { fromEmployer: true, toEmployer: true },
    orderBy: { tradeDate: 'asc' },
  });

  res.json({ trades });
});

// 4) Approve a trade (ADMIN only)
router.patch('/:id/approve', authMiddleware, async (req: CustomRequest, res: Response): Promise<any> => {
  const me = await prisma.user.findUnique({ where: { email: req.email! } });
  if (!me || me.role !== 'ADMIN') return res.sendStatus(403);

  const tradeId = Number(req.params.id);

  try {
    const completedTrade = await prisma.$transaction(async (tx) => {
      // a) mark the trade completed
      const t = await tx.trade.update({
        where: { id: tradeId },
        data: { status: TradeStatus.COMPLETED },
      });
      // b) decrement seller’s credits
      await tx.employer.update({
        where: { id: t.fromEmployerId },
        data: { credits: { decrement: t.credits } },
      });
      // c) increment buyer’s credits
      await tx.employer.update({
        where: { id: t.toEmployerId },
        data: { credits: { increment: t.credits } },
      });
      return t;
    });

    return res.json({ trade: completedTrade });
  } catch (err) {
    console.error('Error approving trade:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// 5) Reject a trade (ADMIN only)
router.patch('/:id/reject', authMiddleware, async (req: CustomRequest, res: Response): Promise<any> => {
  const me = await prisma.user.findUnique({ where: { email: req.email! } });
  if (!me || me.role !== 'ADMIN') return res.sendStatus(403);

  const tradeId = Number(req.params.id);
  try {
    const rejectedTrade = await prisma.trade.update({
      where: { id: tradeId },
      data: { status: TradeStatus.REJECTED },
    });
    return res.json({ trade: rejectedTrade });
  } catch (err) {
    console.error('Error rejecting trade:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

export default router;
