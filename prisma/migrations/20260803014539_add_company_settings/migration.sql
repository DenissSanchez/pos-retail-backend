-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "autoPrintReceipt" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "paperWidth" TEXT NOT NULL DEFAULT '80mm',
ADD COLUMN     "ticketFooter" TEXT,
ADD COLUMN     "ticketHeader" TEXT,
ADD COLUMN     "website" TEXT;
