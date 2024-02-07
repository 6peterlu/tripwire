/*
  Warnings:

  - Added the required column `metricType` to the `Metric` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "MetricType" AS ENUM ('COUNT', 'UNIQUE_VALUES');

-- AlterTable
ALTER TABLE "Metric" ADD COLUMN     "metricType" "MetricType" NOT NULL;
