-- CreateTable
CREATE TABLE "GenericRule" (
    "customerID" TEXT NOT NULL,
    "ruleID" TEXT NOT NULL,
    "ruleDefinition" JSONB NOT NULL,

    CONSTRAINT "GenericRule_pkey" PRIMARY KEY ("ruleID")
);

-- CreateTable
CREATE TABLE "GenericRuleState" (
    "ruleStateID" TEXT NOT NULL,
    "ruleID" TEXT NOT NULL,
    "ruleInternalID" TEXT NOT NULL,
    "state" JSONB NOT NULL,

    CONSTRAINT "GenericRuleState_pkey" PRIMARY KEY ("ruleStateID")
);

-- AddForeignKey
ALTER TABLE "GenericRule" ADD CONSTRAINT "GenericRule_customerID_fkey" FOREIGN KEY ("customerID") REFERENCES "Customer"("customerID") ON DELETE RESTRICT ON UPDATE CASCADE;
