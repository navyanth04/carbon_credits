import express, { Request, Response, NextFunction } from 'express';
import { z, ZodSchema } from 'zod';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/middleware';

const prisma = new PrismaClient();
const router = express.Router();

const tripSchema: ZodSchema = z.object({
  startLocation: z.string(),
  endLocation: z.string(),
  startLatitude: z.number(),
  startLongitude: z.number(),
  endLatitude: z.number().optional(),
  endLongitude: z.number().optional(),
  distance: z.number(),         // Total distance traveled (in meters)
  milesSaved: z.number(),       // Miles not driven due to alternative transport
  method: z.enum(["GOVERNMENT_TRANSPORTATION", "CARPOOLING", "PUBLIC_TRANSPORTATION", "RIDESHARE", "WORK_FROM_HOME"]),
  date: z.date().optional(),    // Optional: if not provided, can default to now in DB
  points: z.number(),           // Points earned for the trip
  maxSpeed: z.number().optional(),
  duration: z.number().optional(),
  averageSpeed: z.number().optional(),
});

// POST /trip
router.post('/trip', authMiddleware, async (req: CustomRequest, res: Response): Promise<any> => {
  // Validate the incoming trip data
  const parseResult = tripSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ message: "Invalid trip data", errors: parseResult.error.errors });
  }
  console.log(parseResult);
  // Ensure the user is authenticated (email has been attached by authMiddleware)
  if (!req.email) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  try {
    // Find the user making the request
    const userDB = await prisma.user.findFirst({
      where: { email: req.email },
    });
    
    if (!userDB) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Prepare trip data with the user's id
    const tripData = {
      ...parseResult.data,
      userId: userDB.id,
    };

    // Create the Trip record in your database
    const newTrip = await prisma.trip.create({
      data: tripData,
    });
    
    return res.status(201).json({ message: "Trip recorded successfully", trip: newTrip });
  } catch (error) {
    console.error("Error recording trip:", error);
    return res.status(500).json({ message: "Error recording trip" });
  }
});

// Backend Route: GET /trips

// Extend Express Request to attach email (if not already done)
interface CustomRequest extends Request {
  email?: string;
}

router.get('/trips', authMiddleware, async (req: CustomRequest, res: Response): Promise<any> => {
  if (!req.email) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    // Query trips where the related user has the authenticated email.
    // Adjust ordering and selection as needed.
    const trips = await prisma.trip.findMany({
      where: { user: { email: req.email } },
      orderBy: { date: 'desc' },
    });
    return res.status(200).json({ trips });
  } catch (error) {
    console.error("Error retrieving trips:", error);
    return res.status(500).json({ message: "Error retrieving trips" });
  }
});

export default router;
