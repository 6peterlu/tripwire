/*
  Warnings:

  - A unique constraint covering the columns `[userID,metricID,endTime]` on the table `UserMetricValue` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "UserMetricValue" ALTER COLUMN "endTime" DROP NOT NULL;

-- CreateIndex
-- NOTE: manually created because prisma does not support initially deferred
ALTER TABLE "UserMetricValue" ADD CONSTRAINT "UserMetricValue_userID_metricID_endTime_key" UNIQUE ("userID", "metricID", "endTime") INITIALLY DEFERRED;

