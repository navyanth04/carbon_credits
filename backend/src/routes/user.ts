import express, { Request, Response, NextFunction } from 'express';
import { z, ZodSchema } from 'zod';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();
import { authMiddleware } from '../middleware/middleware';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = express.Router();

router.use(express.json());

// Schema for signup – note that we no longer expect role or userName from the client
const signupSchema: ZodSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email().transform((val) => val.toLowerCase()),
  password: z.string().min(5),
});

// Signup route – every new user will have role "EMPLOYEE"

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
  email: z.string().email().transform((val) => val.toLowerCase()),
  password: z.string().min(5),
});

// Signin route
router.post('/login', async (req: Request, res: Response) : Promise<any>=> {
  const parseResult = signinSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ message: "Send valid credentials" });
  }

  const { email, password } = parseResult.data;
  // Search for a user matching the provided email, password, and role = EMPLOYEE
  const userDB = await prisma.user.findFirst({
    where: { email, password, role: "EMPLOYEE" },
  });
  
  if (!userDB) {
    return res.status(401).json({ message: "Invalid credentials" });
  }
  
  if (!process.env.JWT_PASSWORD) {
    return res.status(500).json({ message: "JWT secret is not defined" });
  }
  
  const token = jwt.sign({ email }, process.env.JWT_PASSWORD);
  const level = 0;
  return res.status(200).json({ message: "EMPLOYEE logged in successfully", token, level });
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


router.get('/profile', authMiddleware, async(req:CustomRequest, res:Response): Promise<any>=>{
  const userDB = await prisma.user.findFirst({
    where: { email: req.email },
  });

  if (!userDB) {
    return res.status(404).json({ message: "User not found" });
  }

  return res.status(200).json({userDB})
})

router.put('/update', authMiddleware, async(req:CustomRequest, res:Response): Promise<any>=>{
const parseResult = signupSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ message: "Incorrect inputs" });
    }

    console.log(parseResult.data);
    const { email, password, firstName, lastName } = parseResult.data;


    // Get the authenticated user's email from the middleware
    if (!req.email) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      // Check if the email is being changed to one that belongs to another user.
      if (email !== req.email) {
        const emailInUse = await prisma.user.findFirst({
          where: { email },
        });
        if (emailInUse) {
          return res.status(409).json({ message: "Email already taken" });
        }
      }

      // Update the user identified by req.email
      const updatedUser = await prisma.user.update({
        where: { email: req.email },
        data: {
          firstName,
          lastName,
          email, // update the email field if changed
          ...(password ? { password } : {}), // only update password if provided
        },
      });

      return res.status(200).json({ message: "Updated successfully", user: updatedUser });
    } catch (error) {
      console.error("Error updating user:", error);
      return res.status(500).json({ message: "Error updating user" });
    }
  })

export default router;
