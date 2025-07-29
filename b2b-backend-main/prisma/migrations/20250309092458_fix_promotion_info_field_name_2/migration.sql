/*
  Warnings:

  - You are about to drop the column `romotionInfo` on the `OrderItem` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "OrderItem" DROP COLUMN "romotionInfo",
ADD COLUMN     "promotionInfo" TEXT;
