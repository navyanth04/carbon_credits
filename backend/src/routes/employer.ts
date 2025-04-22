// src/routes/employer.ts
import express, { Request, Response } from 'express';
import { z, ZodSchema } from 'zod';
import { PrismaClient, Role } from '@prisma/client';
import { authMiddleware }     from '../middleware/middleware';


interface CustomRequest extends Request {
    email?: string;
}
  

const prisma = new PrismaClient();
const router = express.Router();

router.use(express.json());



// Zod schema for employer signup
const employerSignupSchema: ZodSchema = z.object({
  name:     z.string().min(1),
  email:    z.string().email().transform((e) => e.toLowerCase()),
  password: z.string().min(5),
  // you can add more org‑level fields here if needed
});

// POST /api/v1/employer/signup
router.post('/signup', async (req: Request, res: Response): Promise<any> => {
    const result = employerSignupSchema.safeParse(req.body);
    if (!result.success) {
      return res
        .status(400)
        .json({ message: 'Invalid signup data', errors: result.error.format() });
    }
  
    const { name, email, password } = result.data;
  
    // 1) Ensure no existing org uses that email
    const exists = await prisma.employer.findUnique({ where: { email } });
    if (exists) {
      return res.status(409).json({ message: 'Email already taken' });
    }
  
    try {
      // 2) Create the Employer (org record)
      const org = await prisma.employer.create({
        data: {
          name,
          email,
          password,   // storing plain for now; swap to hashed later
          approved: false,
        },
      });
  
      // 3) Create the corresponding User for login
      const user = await prisma.user.create({
        data: {
          firstName:  name,         // you can split name if you want
          lastName:   '',
          email,
          password,   // same plain‑text password
          role:       Role.EMPLOYER,
          approved:   false,        // employer accounts also need admin approval
          employerId: org.id,
        },
      });
  
      // 4) Return success
      return res.status(201).json({
        message:     'Organization registered; pending admin approval',
        employerId:  org.id,
        userId:      user.id,
      });
    } catch (err) {
      console.error('Error creating employer + user:', err);
      return res.status(500).json({ message: 'Server error' });
    }
  });

  // GET /api/v1/employer/list
router.get('/list', async (req, res) => {
    const orgs = await prisma.employer.findMany({
      where: { approved: true },
      select: { id: true, name: true }
    });
    res.json({ employers: orgs });
  });

router.use(authMiddleware);

// GET /api/v1/employer/summary
router.get('/summary',authMiddleware,async (req: CustomRequest, res: Response): Promise<any> => {
    try {
      // 1) Must be logged in as EMPLOYER
      const me = await prisma.user.findUnique({
        where: { email: req.email! },
      });
      if (!me || me.role !== 'EMPLOYER' || !me.employerId) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      // 2) Pull only the bits we need from the employer record
      const org = await prisma.employer.findUnique({
        where: { id: me.employerId },
        select: {
          credits: true,
          cashBalance:   true,  // your new cash field
        },
      });
      if (!org) {
        return res.status(404).json({ message: 'Organization not found' });
      }

      // 3) Count approved vs pending employees
      const [activeCount, pendingCount] = await Promise.all([
        prisma.user.count({
          where: {
            employerId: me.employerId,
            role:       'EMPLOYEE',
            approved:   true,
          },
        }),
        prisma.user.count({
          where: {
            employerId: me.employerId,
            role:       'EMPLOYEE',
            approved:   false,
          },
        }),
      ]);

      // 4) Return everything
      return res.json({
        totalCredits: org.credits,
        cashBalance:  org.cashBalance,
        activeCount,
        pendingCount,
      });
    } catch (err) {
      console.error('Error in summary:', err);
      return res.status(500).json({ message: 'Server error' });
    }
  }
);

// GET /api/v1/employer/employees
router.get('/employees', async (req: CustomRequest, res: Response): Promise<any> => {
  const me = await prisma.user.findUnique({ where: { email: req.email }});
  if (!me || me.role !== 'EMPLOYER' || !me.employerId) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  // fetch all employees of this org
  const employees = await prisma.user.findMany({
    where: { employerId: me.employerId, role: 'EMPLOYEE' },
    orderBy: { lastName: 'asc' },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      approved: true,
    }
  });

  // for each employee, compute their total credits (sum of trip.credits)
  const withCredits = await Promise.all(
    employees.map(async (u) => {
      const agg = await prisma.trip.aggregate({
        where: { userId: u.id },
        _sum: { credits: true },
      });
      return {
        id: u.id,
        firstName: u.firstName,
        lastName: u.lastName,
        email: u.email,
        credits: agg._sum.credits ?? 0,
        status: u.approved ? 'ACTIVE' : 'PENDING',
      };
    })
  );

  return res.json({ employees: withCredits });
});

// POST /api/v1/employer/employees/:id/approve
// POST /api/v1/employer/employees/:id/approve
router.post('/employees/:id/approve',authMiddleware,async (req: CustomRequest, res: Response): Promise<any> => {
    const employeeId = Number(req.params.id);

    // (Optional) verify that req.email’s user is an employer and owns this employee:
    const me = await prisma.user.findUnique({
      where: { email: req.email },
      include: { employer: true }
    });
    if (!me || me.role !== Role.EMPLOYER || me.employerId == null) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    // ensure the target actually belongs to your org
    const target = await prisma.user.findUnique({ where: { id: employeeId } });
    if (!target || target.employerId !== me.employerId) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    try {
      // **Only** approve that single user:
      await prisma.user.update({
        where: { id: employeeId },
        data: { approved: true },
      });

      return res.json({ message: 'Employee approved' });
    } catch (err) {
      console.error('Error approving employee:', err);
      return res.status(500).json({ message: 'Server error' });
    }
  }
);




// POST /api/v1/employer/employees/:id/reject
router.post('/employees/:id/reject', async (req: CustomRequest, res: Response):Promise<any> => {
  const me = await prisma.user.findUnique({ where: { email: req.email }});
  if (!me || me.role !== 'EMPLOYER' || !me.employerId) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  const targetId = Number(req.params.id);
  const target = await prisma.user.findUnique({ where: { id: targetId }});
  if (!target || target.employerId !== me.employerId) {
    return res.status(404).json({ message: 'Employee not found' });
  }

  // reject (you could also delete or disable; here we just mark as not approved)
  await prisma.user.update({
    where: { id: targetId },
    data: { approved: false },
  });

  return res.json({ message: 'Employee rejected' });
});

router.get('/others',authMiddleware,async (req: CustomRequest, res: Response): Promise<any> => {
    // 1) Must be logged in
    if (!req.email) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // 2) Look up requesting user
    const me = await prisma.user.findUnique({
      where: { email: req.email },
    });
    if (
      !me ||
      me.role !== 'EMPLOYER' ||      // only employers can call this
      !me.employerId                  // ensure they actually belong to one
    ) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    // 3) Find all other approved employers
    const others = await prisma.employer.findMany({
      where: {
        id: { not: me.employerId },
        approved: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
      orderBy: { name: 'asc' },
    });

    return res.status(200).json({ employers: others });
  }
);
  

export default router;
