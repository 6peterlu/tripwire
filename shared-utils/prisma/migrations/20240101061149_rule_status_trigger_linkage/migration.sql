/*
  Warnings:

  - You are about to drop the column `metricID` on the `Rule` table. All the data in the column will be lost.
  - You are about to drop the `BanRuleUserStatusUpdateLinkage` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "BanRuleUserStatusUpdateLinkage" DROP CONSTRAINT "BanRuleUserStatusUpdateLinkage_ruleID_fkey";

-- DropForeignKey
ALTER TABLE "BanRuleUserStatusUpdateLinkage" DROP CONSTRAINT "BanRuleUserStatusUpdateLinkage_userStatusUpdateID_fkey";

-- DropForeignKey
ALTER TABLE "Rule" DROP CONSTRAINT "Rule_metricID_fkey";

-- AlterTable
ALTER TABLE "Rule" DROP COLUMN "metricID";

-- DropTable
DROP TABLE "BanRuleUserStatusUpdateLinkage";

-- CreateTable
CREATE TABLE "RuleUserStatusTriggerLinkage" (
    "ruleID" TEXT NOT NULL,
    "userStatusTriggerID" TEXT NOT NULL,

    CONSTRAINT "RuleUserStatusTriggerLinkage_pkey" PRIMARY KEY ("ruleID","userStatusTriggerID")
);

-- CreateTable
CREATE TABLE "RuleUserStatusUpdateLinkage" (
    "ruleID" TEXT NOT NULL,
    "userStatusUpdateID" TEXT NOT NULL,

    CONSTRAINT "RuleUserStatusUpdateLinkage_pkey" PRIMARY KEY ("ruleID","userStatusUpdateID")
);

-- AddForeignKey
ALTER TABLE "RuleUserStatusTriggerLinkage" ADD CONSTRAINT "RuleUserStatusTriggerLinkage_ruleID_fkey" FOREIGN KEY ("ruleID") REFERENCES "Rule"("ruleID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RuleUserStatusTriggerLinkage" ADD CONSTRAINT "RuleUserStatusTriggerLinkage_userStatusTriggerID_fkey" FOREIGN KEY ("userStatusTriggerID") REFERENCES "UserStatusUpdate"("userStatusUpdateID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RuleUserStatusUpdateLinkage" ADD CONSTRAINT "RuleUserStatusUpdateLinkage_ruleID_fkey" FOREIGN KEY ("ruleID") REFERENCES "Rule"("ruleID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RuleUserStatusUpdateLinkage" ADD CONSTRAINT "RuleUserStatusUpdateLinkage_userStatusUpdateID_fkey" FOREIGN KEY ("userStatusUpdateID") REFERENCES "UserStatusUpdate"("userStatusUpdateID") ON DELETE RESTRICT ON UPDATE CASCADE;
