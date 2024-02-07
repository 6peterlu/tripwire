/*
  Warnings:

  - A unique constraint covering the columns `[ruleID,ruleInternalID]` on the table `GenericRuleState` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "GenericRuleState_ruleID_ruleInternalID_key" ON "GenericRuleState"("ruleID", "ruleInternalID");
