/*
  Warnings:

  - You are about to drop the column `ruleInternalID` on the `GenericRuleState` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[ruleID,functionInstanceID,functionInternalID]` on the table `GenericRuleState` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `functionInstanceID` to the `GenericRuleState` table without a default value. This is not possible if the table is not empty.
  - Added the required column `functionInternalID` to the `GenericRuleState` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "GenericRuleState_ruleID_ruleInternalID_key";

-- AlterTable
ALTER TABLE "GenericRuleState" DROP COLUMN "ruleInternalID",
ADD COLUMN     "functionInstanceID" TEXT NOT NULL,
ADD COLUMN     "functionInternalID" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "GenericRuleState_ruleID_functionInstanceID_functionInternal_key" ON "GenericRuleState"("ruleID", "functionInstanceID", "functionInternalID");
