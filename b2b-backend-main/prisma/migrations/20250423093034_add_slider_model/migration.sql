-- CreateTable
CREATE TABLE "Slider" (
    "id" SERIAL NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 1,
    "link" TEXT,
    "extraData" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Slider_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Slider_displayOrder_idx" ON "Slider"("displayOrder");

-- CreateIndex
CREATE INDEX "Slider_isActive_idx" ON "Slider"("isActive");
