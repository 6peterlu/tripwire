/*
  Warnings:

  - Added the required column `customerID` to the `Metric` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Metric" ADD COLUMN     "customerID" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Metric" ADD CONSTRAINT "Metric_customerID_fkey" FOREIGN KEY ("customerID") REFERENCES "Customer"("customerID") ON DELETE RESTRICT ON UPDATE CASCADE;
