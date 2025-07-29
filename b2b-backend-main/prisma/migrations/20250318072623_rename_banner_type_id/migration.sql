-- Rename column from bannerId to bannerTypeId
-- First, add the new column (nullable temporarily)
ALTER TABLE "Banner" ADD COLUMN "bannerTypeId" INTEGER;

-- Copy data from the old column to the new one
UPDATE "Banner" SET "bannerTypeId" = "bannerId";

-- Make the new column NOT NULL
ALTER TABLE "Banner" ALTER COLUMN "bannerTypeId" SET NOT NULL;

-- Drop the foreign key constraint on bannerId
ALTER TABLE "Banner" DROP CONSTRAINT "Banner_bannerId_fkey";

-- Add the foreign key constraint to the new column
ALTER TABLE "Banner" ADD CONSTRAINT "Banner_bannerTypeId_fkey" FOREIGN KEY ("bannerTypeId") REFERENCES "BannerType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Drop the old column
ALTER TABLE "Banner" DROP COLUMN "bannerId";