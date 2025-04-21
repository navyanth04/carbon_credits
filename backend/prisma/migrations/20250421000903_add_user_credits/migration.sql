-- AlterTable
ALTER TABLE "User" ADD COLUMN     "credits" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "User_employerId_idx" ON "User"("employerId");
