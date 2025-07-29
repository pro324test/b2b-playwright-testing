/*
  Warnings:

  - Added the required column `paymentMethod` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subtotal` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "discountAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "paymentMethod" TEXT NOT NULL DEFAULT 'cod', -- Add a default value
ADD COLUMN     "shippingAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "shippingCity" TEXT,
ADD COLUMN     "shippingNotes" TEXT,
ADD COLUMN     "shippingStreet" TEXT,
ADD COLUMN     "subtotal" DECIMAL(10,2) NOT NULL DEFAULT 0, -- Add a default value
ADD COLUMN     "userAddressId" INTEGER,
ALTER COLUMN "paymentStatus" SET DEFAULT 'pending',
ALTER COLUMN "updatedAt" DROP DEFAULT;

-- CreateIndex
CREATE INDEX "Order_userAddressId_idx" ON "Order"("userAddressId");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_userAddressId_fkey" FOREIGN KEY ("userAddressId") REFERENCES "UserAddress"("id") ON DELETE SET NULL ON UPDATE CASCADE;
