-- AlterTable
ALTER TABLE "User" ADD COLUMN     "avatar" TEXT,
ADD COLUMN     "lastLogin" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "ImportHistory" (
    "id" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "totalRows" INTEGER NOT NULL,
    "importedRows" INTEGER NOT NULL,
    "newProducts" INTEGER NOT NULL,
    "newVariants" INTEGER NOT NULL,
    "updatedRows" INTEGER NOT NULL,
    "errorRows" INTEGER NOT NULL,
    "durationMs" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'COMPLETADA',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ImportHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImportHistoryDetail" (
    "id" TEXT NOT NULL,
    "importId" TEXT NOT NULL,
    "rowNumber" INTEGER NOT NULL,
    "product" TEXT,
    "brand" TEXT,
    "category" TEXT,
    "color" TEXT,
    "size" TEXT,
    "status" TEXT NOT NULL,
    "message" TEXT,
    "sku" TEXT,

    CONSTRAINT "ImportHistoryDetail_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ImportHistoryDetail_importId_idx" ON "ImportHistoryDetail"("importId");

-- AddForeignKey
ALTER TABLE "ImportHistoryDetail" ADD CONSTRAINT "ImportHistoryDetail_importId_fkey" FOREIGN KEY ("importId") REFERENCES "ImportHistory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
