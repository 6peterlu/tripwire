/*
  Warnings:

  - The primary key for the `UserMetricValue` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[userID,metricID,startTime]` on the table `UserMetricValue` will be added. If there are existing duplicate values, this will fail.
  - The required column `userMetricValueID` was added to the `UserMetricValue` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "UserMetricValue" DROP CONSTRAINT "UserMetricValue_pkey",
ADD COLUMN     "userMetricValueID" TEXT NOT NULL,
ALTER COLUMN "startTime" DROP NOT NULL,
ADD CONSTRAINT "UserMetricValue_pkey" PRIMARY KEY ("userMetricValueID");

-- NOTE: manually created because prisma does not support initially deferred
ALTER TABLE "UserMetricValue" ADD CONSTRAINT "UserMetricValue_userID_metricID_startTime_key" UNIQUE ("userID", "metricID", "startTime") INITIALLY DEFERRED;
