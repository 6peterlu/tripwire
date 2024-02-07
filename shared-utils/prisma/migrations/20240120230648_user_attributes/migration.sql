-- AlterTable
ALTER TABLE "User" ADD COLUMN     "attributeMap" JSONB NOT NULL DEFAULT '{}';

-- CreateTable
CREATE TABLE "GenericRuleActionLinkage" (
    "ruleActionID" TEXT NOT NULL,
    "ruleID" TEXT NOT NULL,
    "genericRuleActionLinkage" TEXT NOT NULL,

    CONSTRAINT "GenericRuleActionLinkage_pkey" PRIMARY KEY ("genericRuleActionLinkage")
);

-- AddForeignKey
ALTER TABLE "GenericRuleActionLinkage" ADD CONSTRAINT "GenericRuleActionLinkage_ruleActionID_fkey" FOREIGN KEY ("ruleActionID") REFERENCES "GenericRuleAction"("ruleActionID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GenericRuleActionLinkage" ADD CONSTRAINT "GenericRuleActionLinkage_ruleID_fkey" FOREIGN KEY ("ruleID") REFERENCES "GenericRule"("ruleID") ON DELETE CASCADE ON UPDATE CASCADE;
