-- CreateTable
CREATE TABLE "_ShopPriceRules" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_ShopPriceRules_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ShopPriceRules_B_index" ON "_ShopPriceRules"("B");

-- AddForeignKey
ALTER TABLE "_ShopPriceRules" ADD CONSTRAINT "_ShopPriceRules_A_fkey" FOREIGN KEY ("A") REFERENCES "PriceRule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ShopPriceRules" ADD CONSTRAINT "_ShopPriceRules_B_fkey" FOREIGN KEY ("B") REFERENCES "Shop"("id") ON DELETE CASCADE ON UPDATE CASCADE;
