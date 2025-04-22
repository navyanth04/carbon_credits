/*
  Warnings:

  - A unique constraint covering the columns `[sessionId,userId]` on the table `RideSessionParticipant` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "RideSessionParticipant_sessionId_userId_key" ON "RideSessionParticipant"("sessionId", "userId");
