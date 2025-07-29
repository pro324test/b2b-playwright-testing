/*
  Warnings:

  - Added the required column `creatorId` to the `Coupon` table without a default value. This is not possible if the table is not empty.
  - Added the required column `creatorType` to the `Coupon` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "BogoRule" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Coupon" ADD COLUMN     "creatorId" INTEGER NOT NULL,
ADD COLUMN     "creatorType" TEXT NOT NULL,
ADD COLUMN     "vendorId" INTEGER;

-- AlterTable
ALTER TABLE "InventoryReservation" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Order" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AddForeignKey
ALTER TABLE "Coupon" ADD CONSTRAINT "Coupon_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE SET NULL ON UPDATE CASCADE;
