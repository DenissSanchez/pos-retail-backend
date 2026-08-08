-- AlterTable
ALTER TABLE "Session" ADD COLUMN     "difference" DECIMAL(10,2),
ADD COLUMN     "expectedCash" DECIMAL(10,2),
ADD COLUMN     "notes" TEXT;
