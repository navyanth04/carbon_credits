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
    firstName: z.string(),
    lastName: z.string(),
    email: z.string().email().transform((val) => val.toLowerCase()),
    password: z.string().min(5),
  });

router.post('/signup', async (req: Request, res: Response): Promise<any>=> {
  const parseResult = signupSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ message: "Incorrect inputs" });
  }
  
  // Destructure only the fields defined in the schema
  const { email, password, firstName, lastName } = parseResult.data;
  
  // Check if a user with this email already exists
  const userExists = await prisma.user.findFirst({
    where: { email },
  });
  
  if (userExists) {
    return res.status(409).json({ message: "Email already taken" });
  }

  try {
    const newUser = await prisma.user.create({
      data: {
        email,
        password,
        firstName,
        lastName,
        role: "EMPLOYEE",  // Set the role explicitly to EMPLOYEE
      },
    });
    
    if (!process.env.JWT_PASSWORD) {
      return res.status(500).json({ message: "JWT secret is not defined" });
    }
    
    const token = jwt.sign({ email }, process.env.JWT_PASSWORD);
    const level = 0; // Since every user is an EMPLOYEE
    
    return res.status(201).json({ message: "EMPLOYEE created successfully", token, level });
  } catch (error) {
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

// Auth route – returns the level (always 0 since role is EMPLOYEE)
router.get('/auth', authMiddleware, async (req: CustomRequest, res: Response): Promise<any> => {
  // authMiddleware should attach the email property to req
  const userDB = await prisma.user.findFirst({
    where: { email: req.email },
  });
  
  if (!userDB) {
    return res.status(404).json({ message: "User not found" });
  }
  
  const level = 0;
  return res.status(200).json({ level });
});

export default router;