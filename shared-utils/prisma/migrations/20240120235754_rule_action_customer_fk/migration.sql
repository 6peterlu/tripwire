/*
  Warnings:

  - Added the required column `customerID` to the `GenericRuleAction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "GenericRuleAction" ADD COLUMN     "customerID" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "GenericRuleAction" ADD CONSTRAINT "GenericRuleAction_customerID_fkey" FOREIGN KEY ("customerID") REFERENCES "Customer"("customerID") ON DELETE CASCADE ON UPDATE CASCADE;
