-- CreateTable
CREATE TABLE "_PriceRuleToProductVariant" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_PriceRuleToProductVariant_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_PriceRuleToProductVariant_B_index" ON "_PriceRuleToProductVariant"("B");

-- AddForeignKey
ALTER TABLE "_PriceRuleToProductVariant" ADD CONSTRAINT "_PriceRuleToProductVariant_A_fkey" FOREIGN KEY ("A") REFERENCES "PriceRule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PriceRuleToProductVariant" ADD CONSTRAINT "_PriceRuleToProductVariant_B_fkey" FOREIGN KEY ("B") REFERENCES "ProductVariant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
