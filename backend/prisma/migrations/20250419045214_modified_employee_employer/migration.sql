/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Employer` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `password` to the `Employer` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Employer" ADD COLUMN     "address" TEXT,
ADD COLUMN     "contactName" TEXT,
ADD COLUMN     "password" TEXT NOT NULL,
ADD COLUMN     "phone" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "approved" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "Employer_name_key" ON "Employer"("name");
