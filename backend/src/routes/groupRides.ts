// import express, { Request, Response } from "express";
// import { PrismaClient } from "@prisma/client";
// import { authMiddleware } from "../middleware/middleware";
// import { nanoid } from "nanoid";

// const router = express.Router();
// const prisma = new PrismaClient();

// interface CustomRequest extends Request {
//   email?: string;
// }

// /**
//  * 1) Host creates a new ride session
//  */
// router.post(
//   "/rides",
//   authMiddleware,
//   async (req: CustomRequest, res: Response): Promise<any> => {
//     const user = await prisma.user.findUnique({ where: { email: req.email! } });
//     if (!user) return res.sendStatus(403);

//     const code = nanoid(8).toUpperCase();
//     const session = await prisma.rideSession.create({
//       data: { code, hostId: user.id },
//     });
//     res.status(201).json({ sessionId: session.id, code });
//   }
// );

// /**
//  * 2) Join an existing session by code
//  */
// router.post(
//   "/rides/:code/join",
//   authMiddleware,
//   async (req: CustomRequest, res: Response): Promise<any> => {
//     const user = await prisma.user.findUnique({ where: { email: req.email! } });
//     if (!user) return res.sendStatus(403);

//     const session = await prisma.rideSession.findUnique({
//       where: { code: req.params.code },
//     });
//     if (!session) return res.status(404).json({ message: "Session not found" });

//     // prevent duplicates
//     await prisma.rideSessionParticipant.upsert({
//       where: { sessionId_userId: { sessionId: session.id, userId: user.id } },
//       create: { sessionId: session.id, userId: user.id },
//       update: {},
//     });

//     res.json({ sessionId: session.id });
//   }
// );

// /**
//  * 3) Devices push location pings
//  */
// router.patch(
//   "/rides/:id/location",
//   authMiddleware,
//   async (req: CustomRequest, res: Response): Promise<any> => {
//     const { lat, lng, timestamp } = req.body as {
//       lat: number;
//       lng: number;
//       timestamp: string;
//     };
//     const sessionId = Number(req.params.id);
//     const user = await prisma.user.findUnique({ where: { email: req.email! } });
//     if (!user) return res.sendStatus(403);

//     // ensure they’re in the session
//     const part = await prisma.rideSessionParticipant.findUnique({
//       where: { sessionId_userId: { sessionId, userId: user.id } },
//     });
//     if (!part) return res.status(403).json({ message: "Not in session" });

//     await prisma.rideLocation.create({
//       data: {
//         sessionId,
//         userId: user.id,
//         timestamp: new Date(timestamp),
//         lat,
//         lng,
//       },
//     });
//     res.sendStatus(204);
//   }
// );

// /**
//  * 4) Host ends the session — run overlap validation
//  */
// router.patch(
//   "/rides/:id/end",
//   authMiddleware,
//   async (req: CustomRequest, res: Response): Promise<any> => {
//     const sessionId = Number(req.params.id);
//     const user = await prisma.user.findUnique({ where: { email: req.email! } });
//     if (!user) return res.sendStatus(403);

//     const session = await prisma.rideSession.findUnique({
//       where: { id: sessionId },
//       include: { participants: true, locations: true },
//     });
//     if (!session || session.hostId !== user.id) {
//       return res.status(403).json({ message: "Not authorized" });
//     }

//     // bucket traces by user
//     const traces = session.locations.reduce((acc, loc) => {
//       (acc[loc.userId] ||= []).push(loc);
//       return acc;
//     }, {} as Record<number, typeof session.locations>);

//     // helper: haversine distance
//     const toRad = (v: number) => (v * Math.PI) / 180;
//     if (!session) {
//       return res.status(404).json({ message: "Session not found" });
//     }
//     function haversine(
//       a: (typeof session.locations)[0],
//       b: (typeof session.locations)[0]
//     ) {
//       const R = 6371e3;
//       const dLat = toRad(b.lat - a.lat);
//       const dLng = toRad(b.lng - a.lng);
//       const A =
//         Math.sin(dLat / 2) ** 2 +
//         Math.cos(toRad(a.lat)) *
//           Math.cos(toRad(b.lat)) *
//           Math.sin(dLng / 2) ** 2;
//       const C = 2 * Math.atan2(Math.sqrt(A), Math.sqrt(1 - A));
//       return R * C;
//     }

//     // compute overlap fraction per participant vs. host
//     const hostTrace = traces[session.hostId] || [];
//     const results = session.participants.map((p) => {
//       if (p.userId === session.hostId) return { userId: p.userId, overlap: 1 };
//       const other = traces[p.userId] || [];
//       let matches = 0;
//       hostTrace.forEach((ptH) => {
//         // find closest in time on other
//         const nearest = other.reduce((best, ptO) => {
//           return Math.abs(ptO.timestamp.getTime() - ptH.timestamp.getTime()) <
//             Math.abs(best.timestamp.getTime() - ptH.timestamp.getTime())
//             ? ptO
//             : best;
//         }, other[0]);
//         if (nearest && haversine(ptH, nearest) < 50) matches++;
//       });
//       return {
//         userId: p.userId,
//         overlap: hostTrace.length ? matches / hostTrace.length : 0,
//       };
//     });

//     // mark session ended
//     await prisma.rideSession.update({
//       where: { id: sessionId },
//       data: { endedAt: new Date() },
//     });

//     res.json({ results });
//   }
// );

// export default router;
