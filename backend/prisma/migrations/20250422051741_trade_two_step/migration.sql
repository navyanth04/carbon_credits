/*
  Warnings:

  - The values [PENDING] on the enum `TradeStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "TradeStatus_new" AS ENUM ('PENDING_BUYER', 'PENDING_ADMIN', 'COMPLETED', 'REJECTED');
ALTER TABLE "Trade" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Trade" ALTER COLUMN "status" TYPE "TradeStatus_new" USING ("status"::text::"TradeStatus_new");
ALTER TYPE "TradeStatus" RENAME TO "TradeStatus_old";
ALTER TYPE "TradeStatus_new" RENAME TO "TradeStatus";
DROP TYPE "TradeStatus_old";
ALTER TABLE "Trade" ALTER COLUMN "status" SET DEFAULT 'PENDING_BUYER';
COMMIT;

-- AlterTable
ALTER TABLE "Trade" ALTER COLUMN "status" SET DEFAULT 'PENDING_BUYER';
