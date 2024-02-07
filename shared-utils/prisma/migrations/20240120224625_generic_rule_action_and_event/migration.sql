-- CreateEnum
CREATE TYPE "GenericRuleActionType" AS ENUM ('UPDATE_USER_STATUS');

-- CreateTable
CREATE TABLE "GenericRuleAction" (
    "ruleActionID" TEXT NOT NULL,
    "ruleActionType" "GenericRuleActionType" NOT NULL,
    "ruleActionData" JSONB,

    CONSTRAINT "GenericRuleAction_pkey" PRIMARY KEY ("ruleActionID")
);

-- CreateTable
CREATE TABLE "GenericRuleActionEvent" (
    "ruleID" TEXT NOT NULL,
    "ruleActionID" TEXT NOT NULL,
    "genericRuleActionEventID" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GenericRuleActionEvent_pkey" PRIMARY KEY ("genericRuleActionEventID")
);

-- AddForeignKey
ALTER TABLE "GenericRuleActionEvent" ADD CONSTRAINT "GenericRuleActionEvent_ruleID_fkey" FOREIGN KEY ("ruleID") REFERENCES "GenericRule"("ruleID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GenericRuleActionEvent" ADD CONSTRAINT "GenericRuleActionEvent_ruleActionID_fkey" FOREIGN KEY ("ruleActionID") REFERENCES "GenericRuleAction"("ruleActionID") ON DELETE CASCADE ON UPDATE CASCADE;
