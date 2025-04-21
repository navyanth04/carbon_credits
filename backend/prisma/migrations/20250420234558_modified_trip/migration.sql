/*
  Warnings:

  - You are about to drop the column `method` on the `Trip` table. All the data in the column will be lost.
  - You are about to drop the column `points` on the `Trip` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "TransportMode" AS ENUM ('WALKING', 'BIKING', 'BUS', 'RAIL', 'CAR', 'RIDESHARE');

-- AlterTable
ALTER TABLE "Trip" DROP COLUMN "method",
DROP COLUMN "points",
ADD COLUMN     "credits" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
ADD COLUMN     "emmissions" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
ADD COLUMN     "transportMode" "TransportMode" NOT NULL DEFAULT 'CAR';

-- CreateIndex
CREATE INDEX "Trip_userId_date_idx" ON "Trip"("userId", "date");
