-- AlterTable: rename estimatedPrice to price (preserva i dati esistenti)
ALTER TABLE "Project" RENAME COLUMN "estimatedPrice" TO "price";

-- AlterTable: rimuovi finalPrice
ALTER TABLE "Project" DROP COLUMN "finalPrice";

-- AlterTable: rimuovi amount da Payment
ALTER TABLE "Payment" DROP COLUMN "amount";
