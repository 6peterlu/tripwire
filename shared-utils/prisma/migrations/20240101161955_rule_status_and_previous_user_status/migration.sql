/*
  Warnings:

  - Added the required column `previousUserStatusID` to the `UserStatusUpdate` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "RuleStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- AlterTable
ALTER TABLE "Rule" ADD COLUMN     "status" "RuleStatus" NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "UserStatusUpdate" ADD COLUMN     "previousUserStatusID" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "UserStatusUpdate" ADD CONSTRAINT "UserStatusUpdate_previousUserStatusID_fkey" FOREIGN KEY ("previousUserStatusID") REFERENCES "UserStatus"("statusID") ON DELETE RESTRICT ON UPDATE CASCADE;
