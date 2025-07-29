/*
  Warnings:

  - You are about to drop the column `appliedRuleId` on the `CartItem` table. All the data in the column will be lost.
  - You are about to drop the column `appliedRuleId` on the `OrderItem` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "PriceRule_type_idx";

-- AlterTable
ALTER TABLE "CartItem" DROP COLUMN "appliedRuleId",
ADD COLUMN     "appliedRuleIds" INTEGER[] DEFAULT ARRAY[]::INTEGER[];

-- AlterTable
ALTER TABLE "OrderItem" DROP COLUMN "appliedRuleId",
ADD COLUMN     "appliedRuleIds" INTEGER[] DEFAULT ARRAY[]::INTEGER[];
