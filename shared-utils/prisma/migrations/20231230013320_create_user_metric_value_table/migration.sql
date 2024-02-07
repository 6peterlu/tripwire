/*
  Warnings:

  - Added the required column `metricName` to the `Metric` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Metric" ADD COLUMN     "metricName" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "UserMetricValue" (
    "userID" TEXT NOT NULL,
    "metricID" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserMetricValue_pkey" PRIMARY KEY ("userID","metricID","startTime")
);

-- AddForeignKey
ALTER TABLE "UserMetricValue" ADD CONSTRAINT "UserMetricValue_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("userID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserMetricValue" ADD CONSTRAINT "UserMetricValue_metricID_fkey" FOREIGN KEY ("metricID") REFERENCES "Metric"("metricID") ON DELETE RESTRICT ON UPDATE CASCADE;
