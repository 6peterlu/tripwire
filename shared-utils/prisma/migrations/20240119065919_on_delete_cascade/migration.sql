-- AddForeignKey
ALTER TABLE "GenericRuleState" ADD CONSTRAINT "GenericRuleState_ruleID_fkey" FOREIGN KEY ("ruleID") REFERENCES "GenericRule"("ruleID") ON DELETE CASCADE ON UPDATE CASCADE;
