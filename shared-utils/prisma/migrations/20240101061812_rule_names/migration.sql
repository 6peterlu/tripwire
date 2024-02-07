/*
  Warnings:

  - Added the required column `name` to the `Rule` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Rule" ADD COLUMN     "name" TEXT NOT NULL;
