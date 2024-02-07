/*
  Warnings:

  - Added the required column `customerID` to the `Rule` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Rule" ADD COLUMN     "customerID" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Rule" ADD CONSTRAINT "Rule_customerID_fkey" FOREIGN KEY ("customerID") REFERENCES "Customer"("customerID") ON DELETE RESTRICT ON UPDATE CASCADE;
