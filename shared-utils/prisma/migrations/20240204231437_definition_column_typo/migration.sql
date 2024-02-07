/*
  Warnings:

  - You are about to drop the column `signatureDefintion` on the `GenericRule` table. All the data in the column will be lost.
  - Added the required column `signatureDefinition` to the `GenericRule` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "GenericRule" DROP COLUMN "signatureDefintion",
ADD COLUMN     "signatureDefinition" JSONB NOT NULL;

-- CreateTable
CREATE TABLE "UserSignature" (
    "signatureID" TEXT NOT NULL,

    CONSTRAINT "UserSignature_pkey" PRIMARY KEY ("signatureID")
);

-- CreateTable
CREATE TABLE "UserSignatureLinkage" (
    "signatureID" TEXT NOT NULL,
    "userID" TEXT NOT NULL,

    CONSTRAINT "UserSignatureLinkage_pkey" PRIMARY KEY ("signatureID","userID")
);

-- AddForeignKey
ALTER TABLE "UserSignatureLinkage" ADD CONSTRAINT "UserSignatureLinkage_signatureID_fkey" FOREIGN KEY ("signatureID") REFERENCES "UserSignature"("signatureID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSignatureLinkage" ADD CONSTRAINT "UserSignatureLinkage_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("userID") ON DELETE RESTRICT ON UPDATE CASCADE;
