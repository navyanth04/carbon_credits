-- AlterTable
ALTER TABLE "Trip" ADD COLUMN     "title" TEXT NOT NULL DEFAULT 'Trip';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "address" TEXT,
ADD COLUMN     "contactName" TEXT,
ADD COLUMN     "phone" TEXT;
