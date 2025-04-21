// src/routes/admin.ts
import express, { Request, Response, NextFunction } from 'express';
import { PrismaClient, Role, TradeStatus } from '@prisma/client';
import { authMiddleware } from '../middleware/middleware';

const prisma = new PrismaClient();
const router = express.Router();

interface CustomRequest extends Request {
  email?: string;
}

// Only allow ADMIN users
router.use(authMiddleware);
router.use(async (req: CustomRequest, res: Response, next: NextFunction): Promise<any>=> {
  const me = await prisma.user.findUnique({ where: { email: req.email } });
  if (!me || me.role !== Role.ADMIN) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  next();
});

/**
 * 1) GET  /employers/pending
 *    returns { employers: Employer[] }
 */
router.get('/employers/pending', async (req: CustomRequest, res: Response): Promise<any>=> {
  const employers = await prisma.employer.findMany({
    where: { approved: false },
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true
    }
  });
  return res.json({ employers });
});

/**
 * 2) POST /employers/:id/approve
 *    flips approved=true on both Employer and its matching User record
 */
router.post('/employers/:id/approve', async (req: CustomRequest, res: Response): Promise<any>=> {
  const orgId = Number(req.params.id);
  await prisma.$transaction([
    prisma.employer.update({
      where: { id: orgId },
      data:  { approved: true }
    }),
    prisma.user.updateMany({
      where: {
        role:       Role.EMPLOYER,
        employerId: orgId
      },
      data: { approved: true }
    })
  ]);
  return res.json({ message: 'Employer approved' });
});

/**
 * 3) POST /employers/:id/reject
 *    either delete or leave approved=false
 */
router.post('/employers/:id/reject', async (req: CustomRequest, res: Response): Promise<any>=> {
  const orgId = Number(req.params.id);
  // You could also delete the org here. We'll just keep approved=false.
  await prisma.employer.update({
    where: { id: orgId },
    data:  { approved: false }
  });
  return res.json({ message: 'Employer rejected' });
});

/**
 * 4) GET  /trades/pending
 *    returns { trades: Trade[] } including fromEmployer.name & toEmployer.name
 */
router.get('/trades/pending', async (req: CustomRequest, res: Response): Promise<any>=> {
  const trades = await prisma.trade.findMany({
    where: { status: TradeStatus.PENDING },
    orderBy: { tradeDate: 'asc' },
    include: {
      fromEmployer: { select: { id: true, name: true } },
      toEmployer:   { select: { id: true, name: true } }
    }
  });
  return res.json({ trades });
});

/**
 * 5) POST /trades/:id/approve
 *    sets status=COMPLETED
 */
router.post('/trades/:id/approve', async (req: CustomRequest, res: Response): Promise<any>=> {
  const tradeId = Number(req.params.id);
  await prisma.trade.update({
    where: { id: tradeId },
    data:  { status: TradeStatus.COMPLETED }
  });
  return res.json({ message: 'Trade approved' });
});

/**
 * 6) POST /trades/:id/reject
 *    sets status=REJECTED
 */
router.post('/trades/:id/reject', async (req: CustomRequest, res: Response): Promise<any> => {
  const tradeId = Number(req.params.id);
  await prisma.trade.update({
    where: { id: tradeId },
    data:  { status: TradeStatus.REJECTED }
  });
  return res.json({ message: 'Trade rejected' });
});

router.get('/employers/approved', async (req: CustomRequest, res: Response): Promise<any> => {
    const employers = await prisma.employer.findMany({
      where: { approved: true },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        address: true,
        phone: true,
        contactName: true,
      },
    });
    return res.json({ employers });
  });
  
  /**
   * GET /api/v1/admin/trips
   * Returns all trips in the system,
   * including employee name and employer name for each trip.
   */
  router.get('/trips', async (req: CustomRequest, res: Response): Promise<any> => {
    const trips = await prisma.trip.findMany({
      orderBy: { date: 'desc' },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            employer: {
              select: { name: true }
            }
          }
        }
      }
    });
  
    // transform into a simpler payload
    const payload = trips.map(t => ({
      id:           t.id,
      date:         t.date,
      distance:     t.distance,
      milesSaved:   t.milesSaved,
      method:       t.transportMode,
      points:       t.credits,
      maxSpeed:     t.maxSpeed,
      duration:     t.duration,
      averageSpeed: t.averageSpeed,
      employeeName: `${t.user.firstName} ${t.user.lastName}`,
      employerName: t.user.employer?.name || null,
    }));
  
    return res.json({ trips: payload });
  });

  router.get('/employers/:id', async (req: CustomRequest, res: Response): Promise<any> => {
    const id = Number(req.params.id);
    const employer = await prisma.employer.findUnique({
      where: { id },
      include: {
        // bring back any fields you need on the detail page:
        employees: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            approved: true
          }
        }
      }
    });
  
    if (!employer) {
      return res.status(404).json({ message: 'Employer not found' });
    }
  
    return res.json({ employer });
  });
  

export default router;
