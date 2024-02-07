-- DropForeignKey
ALTER TABLE "GenericRule" DROP CONSTRAINT "GenericRule_customerID_fkey";

-- AddForeignKey
ALTER TABLE "GenericRule" ADD CONSTRAINT "GenericRule_customerID_fkey" FOREIGN KEY ("customerID") REFERENCES "Customer"("customerID") ON DELETE CASCADE ON UPDATE CASCADE;
