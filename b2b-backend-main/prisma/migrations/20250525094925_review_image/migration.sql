/*
  Warnings:

  - You are about to drop the column `mediaUrls` on the `ProductReview` table. All the data in the column will be lost.
  - You are about to drop the column `mediaUrls` on the `ShopReview` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Content" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "ProductReview" DROP COLUMN "mediaUrls";

-- AlterTable
ALTER TABLE "ShopReview" DROP COLUMN "mediaUrls";

-- CreateTable
CREATE TABLE "ReviewImage" (
    "id" SERIAL NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "productReviewId" INTEGER,
    "shopReviewId" INTEGER,

    CONSTRAINT "ReviewImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ReviewImage_productReviewId_idx" ON "ReviewImage"("productReviewId");

-- CreateIndex
CREATE INDEX "ReviewImage_shopReviewId_idx" ON "ReviewImage"("shopReviewId");

-- AddForeignKey
ALTER TABLE "ReviewImage" ADD CONSTRAINT "ReviewImage_productReviewId_fkey" FOREIGN KEY ("productReviewId") REFERENCES "ProductReview"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewImage" ADD CONSTRAINT "ReviewImage_shopReviewId_fkey" FOREIGN KEY ("shopReviewId") REFERENCES "ShopReview"("id") ON DELETE CASCADE ON UPDATE CASCADE;
