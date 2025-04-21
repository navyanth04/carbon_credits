import express, { Request, Response, NextFunction } from 'express';
import { z, ZodSchema } from 'zod';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/middleware';

const prisma = new PrismaClient();
const router = express.Router();

const tripSchema: ZodSchema = z.object({
    startLocation:   z.string(),
    endLocation:     z.string(),
    startLatitude:   z.number(),
    startLongitude:  z.number(),
    endLatitude:     z.number().optional(),
    endLongitude:    z.number().optional(),
    distance:        z.number(),
    milesSaved:      z.number(),
    transportMode:   z.enum(['WALKING','BIKING','BUS','RAIL','CAR','RIDESHARE']),
    date:            z.date().optional(),
    credits:         z.number(),
    maxSpeed:        z.number().optional(),
    duration:        z.number(),
    averageSpeed:    z.number().optional(),
    emmissions:      z.number().optional(),
  });

// POST /trip
router.post('/trip',authMiddleware,async (req: CustomRequest, res: Response): Promise<any> => {
      // 1) validate payload

      const parse = tripSchema.safeParse(req.body)
      if (!parse.success) {
        return res
          .status(400)
          .json({ message: 'Invalid trip data', errors: parse.error.errors })
      }

      // 2) ensure authenticated
      if (!req.email) {
        return res.status(401).json({ message: 'Unauthorized' })
      }
  
      try {
        // 3) look up the user
        const user = await prisma.user.findUnique({
          where: { email: req.email },
        })
        if (!user) {
          return res.status(404).json({ message: 'User not found' })
        }
  
        // 4) assemble the data exactly matching your Prisma model
        const tripData = {
          startLocation:  parse.data.startLocation,
          endLocation:    parse.data.endLocation,
          startLatitude:  parse.data.startLatitude,
          startLongitude: parse.data.startLongitude,
          endLatitude:    parse.data.endLatitude,
          endLongitude:   parse.data.endLongitude,
          distance:       parse.data.distance,
          milesSaved:     parse.data.milesSaved,
          transportMode:  parse.data.transportMode,
          credits:        parse.data.credits,
          maxSpeed:       parse.data.maxSpeed,
          duration:       parse.data.duration,
          averageSpeed:   parse.data.averageSpeed,
          emissions:      parse.data.emissions,
          date:           parse.data.date,    // optional
          userId:         user.id,
        }
  
        // 5) transaction: create trip, bump user, bump employer (if any)
        const [newTrip] = await prisma.$transaction([
          prisma.trip.create({ data: tripData }),
  
          // increment employee’s total credits
          prisma.user.update({
            where: { id: user.id },
            data: { credits: { increment: tripData.credits } },
          }),
  
          // if they belong to an employer, increment that too
          ...(user.employerId
            ? [
                prisma.employer.update({
                  where: { id: user.employerId },
                  data: { credits: { increment: tripData.credits } },
                }),
              ]
            : []),
        ])
  
        return res
          .status(201)
          .json({ message: 'Trip recorded successfully', trip: newTrip })
      } catch (err) {
        console.error('Error recording trip:', err)
        return res.status(500).json({ message: 'Error recording trip' })
      }
    }
  )
  

// Backend Route: GET /trips

// Extend Express Request to attach email (if not already done)
interface CustomRequest extends Request {
  email?: string;
}

// GET /api/v1/employer/trips
router.get('/trips',authMiddleware,async (req: CustomRequest, res: Response): Promise<any> => {
      // 1) Must be logged in
      if (!req.email) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
  
      // 2) Look up the current user
      const me = await prisma.user.findUnique({
        where: { email: req.email },
      });
      if (!me) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // 3) Only employers can hit this
    //   if (me.role !== 'EMPLOYER' || !me.employerId) {
    //     return res.status(403).json({ message: 'Forbidden' });
    //   }
  
      try {
        // 4) Fetch all trips whose user.employerId === me.employerId
        const trips = await prisma.trip.findMany({
          where: {
            user: {
              employerId: me.employerId,
            },
          },
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true, email: true },
            },
          },
          orderBy: { date: 'desc' },
        });
  
        return res.status(200).json({ trips });
      } catch (error) {
        console.error('Error retrieving employer trips:', error);
        return res.status(500).json({ message: 'Error retrieving trips' });
      }
    }
  );
  

export default router;
