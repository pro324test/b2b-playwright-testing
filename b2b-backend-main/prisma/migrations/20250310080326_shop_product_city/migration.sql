-- CreateTable
CREATE TABLE "ShopCity" (
    "id" SERIAL NOT NULL,
    "shopId" INTEGER NOT NULL,
    "cityId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShopCity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductCity" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "cityId" INTEGER NOT NULL,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "isOverride" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductCity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ShopCity_shopId_idx" ON "ShopCity"("shopId");

-- CreateIndex
CREATE INDEX "ShopCity_cityId_idx" ON "ShopCity"("cityId");

-- CreateIndex
CREATE UNIQUE INDEX "ShopCity_shopId_cityId_key" ON "ShopCity"("shopId", "cityId");

-- CreateIndex
CREATE INDEX "ProductCity_productId_idx" ON "ProductCity"("productId");

-- CreateIndex
CREATE INDEX "ProductCity_cityId_idx" ON "ProductCity"("cityId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductCity_productId_cityId_key" ON "ProductCity"("productId", "cityId");

-- AddForeignKey
ALTER TABLE "ShopCity" ADD CONSTRAINT "ShopCity_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShopCity" ADD CONSTRAINT "ShopCity_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductCity" ADD CONSTRAINT "ProductCity_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductCity" ADD CONSTRAINT "ProductCity_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE CASCADE ON UPDATE CASCADE;
