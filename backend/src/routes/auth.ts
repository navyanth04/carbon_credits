import express, { Request, Response, NextFunction } from 'express';
import { z, ZodSchema } from 'zod';
import jwt from 'jsonwebtoken';
import { PrismaClient, Role } from '@prisma/client';
import { authMiddleware } from '../middleware/middleware';

const prisma = new PrismaClient();
const router = express.Router();

router.use(express.json());

// -- signup and login as before, returning role in login response --

// Signup route – every new user will have role "EMPLOYEE"

  const signupSchema: ZodSchema = z.object({
    firstName:  z.string(),
    lastName:   z.string(),
    email:      z.string().email().transform(v => v.toLowerCase()),
    password:   z.string().min(5),
    employerId: z.number().int().optional(),  // <-- new
  });
  
  router.post('/signup', async (req: Request, res: Response): Promise<any> => {
    const parsed = signupSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Incorrect inputs", errors: parsed.error.format() });
    }
  
    const { firstName, lastName, email, password, employerId } = parsed.data;
  
    // 1) Prevent duplicate emails
    const userExists = await prisma.user.findUnique({ where: { email }});
    if (userExists) {
      return res.status(409).json({ message: "Email already taken" });
    }
  
    // 2) If they supplied an employerId, make sure that org exists & is approved
    if (employerId !== undefined) {
      const org = await prisma.employer.findUnique({
        where: { id: employerId, approved: true }
      });
      if (!org) {
        return res.status(400).json({ message: "Invalid or unapproved employer" });
      }
    }
  
    try {
      // 3) Create the User, linking employerId if present
      const newUser = await prisma.user.create({
        data: {
          firstName,
          lastName,
          email,
          password,
          role:       Role.EMPLOYEE,
          approved:   false,           // or false if you want admin to manually approve employees
          employerId,                 // undefined => null in the DB
        },
      });
  
      // 4) Issue JWT
      const secret = process.env.JWT_PASSWORD;
      if (!secret) {
        return res.status(500).json({ message: "JWT secret is not defined" });
      }
      const token = jwt.sign({ email, role: newUser.role }, secret);
  
      return res.status(201).json({
        message: "EMPLOYEE created successfully",
        token,
        level: 0,
      });
    } catch (err) {
      console.error("Error creating user:", err);
      return res.status(500).json({ message: "Error creating user" });
    }
  });

// Schema for signin – again using email and password only
const signinSchema: ZodSchema = z.object({
    email:    z.string().email().transform((v) => v.toLowerCase()),
    password: z.string().min(5),
  });
  
  // Unified login for EMPLOYEE, EMPLOYER, ADMIN
  router.post('/login', async (req: Request, res: Response): Promise<any> => {
    const parseResult = signinSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ message: "Send valid credentials" });
    }
    const { email, password } = parseResult.data;
  
    // 1) Find the user
    const user = await prisma.user.findFirst({
      where: { email, password },
    });
    
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
  
    // 2) If not ADMIN, enforce approved === true
    if (user.role !== Role.ADMIN && !user.approved) {
      return res
        .status(403)
        .json({ message: "Your account is still pending approval" });
    }
  
    // 3) Issue JWT
    const secret = process.env.JWT_PASSWORD;
    if (!secret) {
      return res.status(500).json({ message: "JWT secret is not defined" });
    }
    const token = jwt.sign({ email, role: user.role }, secret);
  
    // 4) Compute numeric level
    const levelMap: Record<Role, number> = {
      [Role.EMPLOYEE]: 0,
      [Role.EMPLOYER]: 1,
      [Role.ADMIN]:    2,
    };
    const level = levelMap[user.role];
  
    return res
      .status(200)
      .json({
        message: `${user.role} logged in successfully`,
        token,
        role: user.role,
        level,
      });
  });

// Extend Express Request to attach an email from authMiddleware
interface CustomRequest extends Request {
  email?: string;
}

// Auth route
router.get('/auth', authMiddleware, async (req: CustomRequest, res: Response): Promise<any> => {
  // authMiddleware should attach the email property to req
  const user = await prisma.user.findUnique({
    where: { email: req.email }
  });
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  // map roles to levels
  const levelMap = {
    [Role.EMPLOYEE]: 0,
    [Role.EMPLOYER]: 1,
    [Role.ADMIN]:    2,
  };

  return res.status(200).json({
    role:  user.role,          // "EMPLOYEE" | "EMPLOYER" | "ADMIN"
    level: levelMap[user.role]
  });
});

export default router;