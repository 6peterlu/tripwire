/*
  Warnings:

  - You are about to drop the `EventMetricDependency` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "EventMetricDependency" DROP CONSTRAINT "EventMetricDependency_eventID_fkey";

-- DropForeignKey
ALTER TABLE "EventMetricDependency" DROP CONSTRAINT "EventMetricDependency_metricID_fkey";

-- DropTable
DROP TABLE "EventMetricDependency";
