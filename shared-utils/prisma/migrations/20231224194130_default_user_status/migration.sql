/*
  Warnings:

  - You are about to drop the column `webhook` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "webhook" TEXT;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "webhook";

-- AlterTable
ALTER TABLE "UserStatus" ADD COLUMN     "default" BOOLEAN NOT NULL DEFAULT false;
