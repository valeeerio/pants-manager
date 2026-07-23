-- CreateTable
CREATE TABLE "NotificaDismissa" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "notificaId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NotificaDismissa_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "NotificaDismissa_userId_notificaId_key" ON "NotificaDismissa"("userId", "notificaId");

-- AddForeignKey
ALTER TABLE "NotificaDismissa" ADD CONSTRAINT "NotificaDismissa_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
