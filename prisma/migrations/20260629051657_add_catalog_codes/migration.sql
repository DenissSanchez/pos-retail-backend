/*
  Warnings:

  - You are about to drop the column `companyId` on the `Brand` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Brand` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[code]` on the table `Brand` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[code]` on the table `Category` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[code]` on the table `Color` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[code]` on the table `Size` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `code` to the `Brand` table without a default value. This is not possible if the table is not empty.
  - Added the required column `code` to the `Category` table without a default value. This is not possible if the table is not empty.
  - Added the required column `code` to the `Color` table without a default value. This is not possible if the table is not empty.
  - Added the required column `code` to the `Size` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Brand" DROP CONSTRAINT "Brand_companyId_fkey";

-- AlterTable
ALTER TABLE "public"."Brand" DROP COLUMN "companyId",
DROP COLUMN "description",
ADD COLUMN     "code" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."Category" ADD COLUMN     "code" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."Color" ADD COLUMN     "code" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."Size" ADD COLUMN     "code" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Brand_code_key" ON "public"."Brand"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Category_code_key" ON "public"."Category"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Color_code_key" ON "public"."Color"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Size_code_key" ON "public"."Size"("code");
