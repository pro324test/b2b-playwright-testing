-- CreateTable
CREATE TABLE "Promotion" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'enabled',
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "shopId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Promotion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BogoRule" (
    "id" SERIAL NOT NULL,
    "buyQuantity" INTEGER NOT NULL,
    "getQuantity" INTEGER NOT NULL,
    "discountPercent" INTEGER,
    "sameProduct" BOOLEAN NOT NULL DEFAULT true,
    "freeProductId" INTEGER,
    "promotionId" INTEGER NOT NULL,
    "applyToAllVariants" BOOLEAN NOT NULL DEFAULT true,
    "maxRedemptionsPerOrder" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BogoRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ApplicableToPromotion" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_ApplicableToPromotion_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_CategoryPromotions" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_CategoryPromotions_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "Promotion_shopId_idx" ON "Promotion"("shopId");

-- CreateIndex
CREATE INDEX "Promotion_status_idx" ON "Promotion"("status");

-- CreateIndex
CREATE INDEX "Promotion_startDate_endDate_idx" ON "Promotion"("startDate", "endDate");

-- CreateIndex
CREATE UNIQUE INDEX "BogoRule_promotionId_key" ON "BogoRule"("promotionId");

-- CreateIndex
CREATE INDEX "BogoRule_promotionId_idx" ON "BogoRule"("promotionId");

-- CreateIndex
CREATE INDEX "_ApplicableToPromotion_B_index" ON "_ApplicableToPromotion"("B");

-- CreateIndex
CREATE INDEX "_CategoryPromotions_B_index" ON "_CategoryPromotions"("B");

-- AddForeignKey
ALTER TABLE "Promotion" ADD CONSTRAINT "Promotion_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BogoRule" ADD CONSTRAINT "BogoRule_freeProductId_fkey" FOREIGN KEY ("freeProductId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BogoRule" ADD CONSTRAINT "BogoRule_promotionId_fkey" FOREIGN KEY ("promotionId") REFERENCES "Promotion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ApplicableToPromotion" ADD CONSTRAINT "_ApplicableToPromotion_A_fkey" FOREIGN KEY ("A") REFERENCES "BogoRule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ApplicableToPromotion" ADD CONSTRAINT "_ApplicableToPromotion_B_fkey" FOREIGN KEY ("B") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CategoryPromotions" ADD CONSTRAINT "_CategoryPromotions_A_fkey" FOREIGN KEY ("A") REFERENCES "BogoRule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CategoryPromotions" ADD CONSTRAINT "_CategoryPromotions_B_fkey" FOREIGN KEY ("B") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;
