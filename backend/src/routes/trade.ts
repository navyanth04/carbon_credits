// src/routes/trades.ts
import express, { Response } from 'express';
import { authMiddleware }   from '../middleware/middleware';
import CustomRequest        from '../interfaces/interface';
import { PrismaClient, TradeStatus } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

/**
 * 1) Propose a new trade (EMPLOYER only)
 *    - checks seller has enough credits
 *    - creates trade in PENDING_BUYER state
 */
router.post(
  '/',
  authMiddleware,
  async (req: CustomRequest, res: Response): Promise<any> => {
    const { toEmployerId, credits, pricePerCredit, description } = req.body;
    const me = await prisma.user.findUnique({ where: { email: req.email! } });
    if (!me || me.role !== 'EMPLOYER' || !me.employerId) {
      return res.sendStatus(403);
    }

    // 2) Check seller’s carbon credits
    const seller = await prisma.employer.findUnique({
      where: { id: me.employerId },
      select: { credits: true },
    });
    if (!seller) {
      return res.status(500).json({ message: 'Seller record not found' });
    }
    if (credits > seller.credits) {
      return res
        .status(400)
        .json({ message: `Insufficient credits: you have ${seller.credits}` });
    }

    // 3) Create trade awaiting buyer’s acceptance
    try {
      const trade = await prisma.trade.create({
        data: {
          fromEmployerId: me.employerId,
          toEmployerId,
          credits,
          pricePerCredit,
          totalPrice: credits * pricePerCredit,
          description,
          status: TradeStatus.PENDING_BUYER,
        },
      });
      return res.status(201).json({ trade });
    } catch (err) {
      console.error('Error creating trade:', err);
      return res.status(500).json({ message: 'Server error' });
    }
  }
);

/**
 * 2) List my org’s trades (incoming & outgoing)
 */
router.get(
  '/my',
  authMiddleware,
  async (req: CustomRequest, res: Response): Promise<any> => {
    const me = await prisma.user.findUnique({ where: { email: req.email! } });
    if (!me || !me.employerId) {
      return res.sendStatus(404);
    }
    const trades = await prisma.trade.findMany({
      where: {
        OR: [
          { fromEmployerId: me.employerId },
          { toEmployerId:   me.employerId },
        ],
      },
      include: { fromEmployer: true, toEmployer: true },
      orderBy: { tradeDate: 'desc' },
    });
    return res.json({ trades });
  }
);

/**
 * 3) Buyer responds to a pending‑buyer trade
 *    - must be the “toEmployer”
 *    - must still be PENDING_BUYER
 *    - if accept: check buyer has enough cashBalance → move to PENDING_ADMIN
 */
router.patch(
  '/:id/respond',
  authMiddleware,
  async (req: CustomRequest, res: Response): Promise<any> => {
    const tradeId = Number(req.params.id);
    const action  = req.body.action as 'accept' | 'reject';

    const [me, trade] = await Promise.all([
      prisma.user.findUnique({ where: { email: req.email! } }),
      prisma.trade.findUnique({ where: { id: tradeId } }),
    ]);
    if (!me || me.role !== 'EMPLOYER' || !me.employerId) {
      return res.sendStatus(403);
    }
    if (!trade) {
      return res.status(404).json({ message: 'Trade not found' });
    }
    if (trade.toEmployerId !== me.employerId) {
      return res.sendStatus(403);
    }
    if (trade.status !== TradeStatus.PENDING_BUYER) {
      return res
        .status(400)
        .json({ message: 'Trade not awaiting buyer response' });
    }

    if (action === 'accept') {
      // check buyer has enough cashBalance
      const buyer = await prisma.employer.findUnique({
        where: { id: me.employerId },
        select: { cashBalance: true },
      });
      if (!buyer) {
        return res.status(500).json({ message: 'Buyer record not found' });
      }
      if ((trade.totalPrice ?? 0) > buyer.cashBalance) {
        return res
          .status(400)
          .json({ message: `Insufficient funds: you have $${buyer.cashBalance}` });
      }

      // move to admin approval
      await prisma.trade.update({
        where: { id: tradeId },
        data: { status: TradeStatus.PENDING_ADMIN },
      });
      return res.json({ message: 'Trade accepted, pending admin approval' });
    } else {
      // buyer rejects
      await prisma.trade.update({
        where: { id: tradeId },
        data: { status: TradeStatus.REJECTED },
      });
      return res.json({ message: 'Trade rejected by buyer' });
    }
  }
);

/**
 * 4) Admin: list all trades pending admin approval
 */
router.get(
  '/pending',
  authMiddleware,
  async (req: CustomRequest, res: Response): Promise<any> => {
    const me = await prisma.user.findUnique({ where: { email: req.email! } });
    if (!me || me.role !== 'ADMIN') {
      return res.sendStatus(403);
    }
    const trades = await prisma.trade.findMany({
      where: { status: TradeStatus.PENDING_ADMIN },
      include: { fromEmployer: true, toEmployer: true },
      orderBy: { tradeDate: 'asc' },
    });
    return res.json({ trades });
  }
);

/**
 * 5) Admin approves a trade
 *    - must be ADMIN
 *    - in one transaction:
 *       • mark trade COMPLETED
 *       • debit seller credits, credit buyer credits
 *       • debit buyer cashBalance,   credit seller cashBalance
 */
router.patch(
  '/:id/approve',
  authMiddleware,
  async (req: CustomRequest, res: Response): Promise<any> => {
    const me = await prisma.user.findUnique({ where: { email: req.email! } });
    if (!me || me.role !== 'ADMIN') {
      return res.sendStatus(403);
    }
    const tradeId = Number(req.params.id);

    try {
      const result = await prisma.$transaction(async (tx) => {
        // mark completed
        const t = await tx.trade.update({
          where: { id: tradeId },
          data: { status: TradeStatus.COMPLETED },
        });

        // seller loses credits, gains cashBalance
        await tx.employer.update({
          where: { id: t.fromEmployerId },
          data: {
            credits: { decrement: t.credits },
            cashBalance:   { increment: t.totalPrice },
          },
        });

        // buyer gains credits, loses cashBalance
        await tx.employer.update({
          where: { id: t.toEmployerId },
          data: {
            credits: { increment: t.credits },
            cashBalance:   { decrement: t.totalPrice },
          },
        });

        return t;
      });

      return res.json({ trade: result });
    } catch (err) {
      console.error('Error approving trade:', err);
      return res.status(500).json({ message: 'Server error' });
    }
  }
);

/**
 * 6) Admin rejects a trade outright
 */
router.patch(
  '/:id/reject',
  authMiddleware,
  async (req: CustomRequest, res: Response): Promise<any> => {
    const me = await prisma.user.findUnique({ where: { email: req.email! } });
    if (!me || me.role !== 'ADMIN') {
      return res.sendStatus(403);
    }
    const tradeId = Number(req.params.id);

    try {
      const trade = await prisma.trade.update({
        where: { id: tradeId },
        data: { status: TradeStatus.REJECTED },
      });
      return res.json({ trade });
    } catch (err) {
      console.error('Error rejecting trade:', err);
      return res.status(500).json({ message: 'Server error' });
    }
  }
);


/**
 * 0) Admin: list _all_ trades (any status)
 */
router.get('/all',authMiddleware,async (req: CustomRequest, res: Response): Promise<any> => {
      // 1) must be ADMIN
      const me = await prisma.user.findUnique({ where: { email: req.email! } })
      if (!me || me.role !== 'ADMIN') {
        return res.sendStatus(403)
      }
  
      // 2) fetch every trade, include both sides
      const trades = await prisma.trade.findMany({
        include: { fromEmployer: true, toEmployer: true },
        orderBy: { tradeDate: 'desc' },
      })
  
      return res.json({ trades })
    }
  )
  

export default router;
