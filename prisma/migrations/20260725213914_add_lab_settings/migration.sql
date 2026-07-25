-- CreateTable
CREATE TABLE "LabSettings" (
    "id" TEXT NOT NULL,
    "shopName" TEXT NOT NULL,
    "phone" TEXT,
    "address" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "defaultVatRate" DECIMAL(5,2) NOT NULL DEFAULT 22,
    "leadTimeDays" INTEGER NOT NULL DEFAULT 5,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LabSettings_pkey" PRIMARY KEY ("id")
);
