-- AlterTable
ALTER TABLE "Cart" ADD COLUMN     "checkoutDate" TIMESTAMP(3),
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "paymentMethod" TEXT;
