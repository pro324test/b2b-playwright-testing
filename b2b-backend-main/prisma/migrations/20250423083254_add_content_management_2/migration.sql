/*
  Warnings:

  - You are about to drop the column `altText` on the `ContentImage` table. All the data in the column will be lost.
  - You are about to drop the column `caption` on the `ContentImage` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ContentImage" DROP COLUMN "altText",
DROP COLUMN "caption",
ALTER COLUMN "displayOrder" SET DEFAULT 1;
