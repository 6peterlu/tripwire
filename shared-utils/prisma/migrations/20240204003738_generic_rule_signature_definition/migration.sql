/*
  Warnings:

  - You are about to drop the column `signatureDefintion` on the `Rule` table. All the data in the column will be lost.
  - Added the required column `signatureDefintion` to the `GenericRule` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "GenericRule" ADD COLUMN     "signatureDefintion" JSONB NOT NULL;

-- AlterTable
ALTER TABLE "Rule" DROP COLUMN "signatureDefintion";
