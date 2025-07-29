-- CreateTable
CREATE TABLE "_CouponToShops" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_CouponToShops_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_CouponToShops_B_index" ON "_CouponToShops"("B");

-- AddForeignKey
ALTER TABLE "_CouponToShops" ADD CONSTRAINT "_CouponToShops_A_fkey" FOREIGN KEY ("A") REFERENCES "Coupon"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CouponToShops" ADD CONSTRAINT "_CouponToShops_B_fkey" FOREIGN KEY ("B") REFERENCES "Shop"("id") ON DELETE CASCADE ON UPDATE CASCADE;
