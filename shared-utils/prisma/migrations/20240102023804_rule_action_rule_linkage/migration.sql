/*
  Warnings:

  - You are about to drop the column `ruleActionID` on the `Rule` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Rule" DROP CONSTRAINT "Rule_ruleActionID_fkey";

-- AlterTable
ALTER TABLE "Rule" DROP COLUMN "ruleActionID";

-- CreateTable
CREATE TABLE "RuleActionRuleLinkage" (
    "ruleActionID" TEXT NOT NULL,
    "ruleID" TEXT NOT NULL,

    CONSTRAINT "RuleActionRuleLinkage_pkey" PRIMARY KEY ("ruleActionID","ruleID")
);

-- AddForeignKey
ALTER TABLE "RuleActionRuleLinkage" ADD CONSTRAINT "RuleActionRuleLinkage_ruleActionID_fkey" FOREIGN KEY ("ruleActionID") REFERENCES "RuleAction"("ruleActionID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RuleActionRuleLinkage" ADD CONSTRAINT "RuleActionRuleLinkage_ruleID_fkey" FOREIGN KEY ("ruleID") REFERENCES "Rule"("ruleID") ON DELETE RESTRICT ON UPDATE CASCADE;
