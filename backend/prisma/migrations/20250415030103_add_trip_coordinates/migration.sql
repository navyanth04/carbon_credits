/*
  Warnings:

  - Added the required column `duration` to the `Trip` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startLatitude` to the `Trip` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startLongitude` to the `Trip` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Trip" ADD COLUMN     "averageSpeed" DOUBLE PRECISION,
ADD COLUMN     "duration" INTEGER NOT NULL,
ADD COLUMN     "endLatitude" DOUBLE PRECISION,
ADD COLUMN     "endLongitude" DOUBLE PRECISION,
ADD COLUMN     "maxSpeed" DOUBLE PRECISION,
ADD COLUMN     "startLatitude" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "startLongitude" DOUBLE PRECISION NOT NULL;
