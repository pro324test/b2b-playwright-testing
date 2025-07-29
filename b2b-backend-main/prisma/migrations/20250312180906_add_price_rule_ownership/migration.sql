-- Add ownership tracking fields to PriceRule
ALTER TABLE "PriceRule" ADD COLUMN "creatorType" TEXT NOT NULL DEFAULT 'admin';
ALTER TABLE "PriceRule" ADD COLUMN "creatorId" INTEGER NOT NULL DEFAULT 1;

-- Remove the defaults after adding the columns
ALTER TABLE "PriceRule" ALTER COLUMN "creatorType" DROP DEFAULT;
ALTER TABLE "PriceRule" ALTER COLUMN "creatorId" DROP DEFAULT;

-- Add indices for better query performance
CREATE INDEX "PriceRule_creatorType_creatorId_idx" ON "PriceRule"("creatorType", "creatorId");
CREATE INDEX "PriceRule_status_idx" ON "PriceRule"("status");
CREATE INDEX "PriceRule_type_idx" ON "PriceRule"("type");