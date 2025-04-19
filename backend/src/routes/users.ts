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

interface CustomRequest extends Request {
  email?: string;
}

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
