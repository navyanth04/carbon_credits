// src/routes/employer.ts
import express, { Request, Response } from 'express';
import { z, ZodSchema } from 'zod';
import { PrismaClient } from '@prisma/client';

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
    return res.status(400).json({ message: 'Invalid signup data', errors: result.error.format() });
  }

  const { name, email, password } = result.data;

  // check email uniqueness
  const exists = await prisma.employer.findUnique({ where: { email } });
  if (exists) {
    return res.status(409).json({ message: 'Email already taken' });
  }

  try {
    // create employer with approved=false
    const employer = await prisma.employer.create({
      data: { name, email, password, approved: false },
    });
    return res
      .status(201)
      .json({ message: 'Registered successfully, pending admin approval', employerId: employer.id });
  } catch (err) {
    console.error('Error creating employer:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

export default router;
