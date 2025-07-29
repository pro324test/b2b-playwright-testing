-- CreateTable
CREATE TABLE "_BogoRuleToProductVariant" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_BogoRuleToProductVariant_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_BogoRuleToProductVariant_B_index" ON "_BogoRuleToProductVariant"("B");

-- AddForeignKey
ALTER TABLE "_BogoRuleToProductVariant" ADD CONSTRAINT "_BogoRuleToProductVariant_A_fkey" FOREIGN KEY ("A") REFERENCES "BogoRule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BogoRuleToProductVariant" ADD CONSTRAINT "_BogoRuleToProductVariant_B_fkey" FOREIGN KEY ("B") REFERENCES "ProductVariant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
