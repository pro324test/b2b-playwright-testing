-- AlterTable
ALTER TABLE "PriceRule" ADD COLUMN     "vendorId" INTEGER;

-- CreateIndex
CREATE INDEX "PriceRule_vendorId_idx" ON "PriceRule"("vendorId");

-- AddForeignKey
ALTER TABLE "PriceRule" ADD CONSTRAINT "PriceRule_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE SET NULL ON UPDATE CASCADE;
