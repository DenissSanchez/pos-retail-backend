-- CreateTable
CREATE TABLE "public"."Sequence" (
    "id" TEXT NOT NULL,
    "nextProductSku" INTEGER NOT NULL DEFAULT 1,
    "nextBarcode" INTEGER NOT NULL DEFAULT 1,
    "nextSaleNumber" INTEGER NOT NULL DEFAULT 1,
    "nextPurchaseNumber" INTEGER NOT NULL DEFAULT 1,
    "nextTransferNumber" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Sequence_pkey" PRIMARY KEY ("id")
);
