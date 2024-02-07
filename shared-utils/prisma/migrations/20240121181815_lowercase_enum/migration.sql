/*
  Warnings:

  - The values [UPDATE_USER_ATTRIBUTE] on the enum `GenericRuleActionType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "GenericRuleActionType_new" AS ENUM ('UpdateUserAttribute');
ALTER TABLE "GenericRuleAction" ALTER COLUMN "ruleActionType" TYPE "GenericRuleActionType_new" USING ("ruleActionType"::text::"GenericRuleActionType_new");
ALTER TYPE "GenericRuleActionType" RENAME TO "GenericRuleActionType_old";
ALTER TYPE "GenericRuleActionType_new" RENAME TO "GenericRuleActionType";
DROP TYPE "GenericRuleActionType_old";
COMMIT;
