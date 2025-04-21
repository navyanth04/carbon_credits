import express from "express";
import cors from "cors";
import rootRouter from './routes/index';
import { PrismaClient } from "@prisma/client";

// Initialize Prisma Client
const prisma = new PrismaClient();

const app = express();
app.use(cors({
  origin: 'https://carbon-credits-backend.vercel.app'
}));
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
