-- AlterTable
ALTER TABLE "Employer" ADD COLUMN     "cashBalance" DOUBLE PRECISION NOT NULL DEFAULT 100;

-- AlterTable
ALTER TABLE "Trade" ADD COLUMN     "description" TEXT,
ADD COLUMN     "expiresAt" TIMESTAMP(3),
ADD COLUMN     "totalPrice" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "Trade_fromEmployerId_idx" ON "Trade"("fromEmployerId");

-- CreateIndex
CREATE INDEX "Trade_toEmployerId_idx" ON "Trade"("toEmployerId");

-- CreateIndex
CREATE INDEX "Trade_status_idx" ON "Trade"("status");
