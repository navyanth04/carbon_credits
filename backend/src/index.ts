import express from "express";
import cors from "cors";
import rootRouter from './routes/index';
import { PrismaClient } from "@prisma/client";

// Initialize Prisma Client
const prisma = new PrismaClient();

const app = express();

app.use(cors());

app.use(express.json());
app.use('/api/v1', rootRouter);

// Test Prisma DB connection
async function testConnection() {
  try {
    // You can make a simple query to ensure DB connection
    await prisma.$connect();
    console.log("Connected to PostgreSQL");

    // Start the server after successful connection
    app.listen(3000, () => {
      console.log("Server up and running on http://localhost:3000");
    });
  } catch (err) {
    console.error("Failed to connect to DB:", err);
    process.exit(1); // Exit if DB connection fails
  }
}

// Run the test connection function
testConnection();

// src/index.ts
// import express, { Request, Response, NextFunction } from 'express';
// import cors from 'cors';
// import rootRouter from './routes/index';
// import { PrismaClient } from '@prisma/client';
// import dotenv from 'dotenv';

// dotenv.config();

// const app = express();
// const prisma = new PrismaClient();

// // Pull your frontend URL from env (set this in Vercel):
// const FRONTEND_URL = process.env.FRONTEND_URL || 'https://carbon-credits-one.vercel.app';

// // 1) Global CORS middleware
// app.use(
//   cors({
//     origin: FRONTEND_URL,
//     credentials: true,
//     methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
//     allowedHeaders: ['Content-Type','Authorization'],
//   })
// );

// // 2) Explicitly handle OPTIONS on * paths (preflight)
// app.options(
//   '*',
//   cors({
//     origin: FRONTEND_URL,
//     credentials: true,
//     methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
//     allowedHeaders: ['Content-Type','Authorization'],
//   })
// );

// app.use(express.json());
// app.use('/api/v1', rootRouter);

// async function start() {
//   try {
//     await prisma.$connect();
//     const port = parseInt(process.env.PORT || '3000', 10);
//     app.listen(port, () => {
//       console.log(`Server listening on http://localhost:${port}`);
//     });
//   } catch (err) {
//     console.error('Failed to connect to database, exiting...', err);
//     process.exit(1);
//   }
// }

// start();

