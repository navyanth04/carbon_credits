import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import CustomRequest from '../interfaces/interface';
dotenv.config();

async function authMiddleware(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(403).json("Authorization header missing or invalid format");
      return;
    }
  
    const token = authHeader.split(' ')[1];
  
    try {
      if(!process.env.JWT_PASSWORD){
        res.status(400).json("error");
        return;
      }
      const decoded = jwt.verify(token, process.env.JWT_PASSWORD) as { email: string };
      req.email = decoded.email;
      next();
    } catch (error) {
      res.status(401).json({ message: "Not authenticated" });
      return;
    }
}

export { authMiddleware };