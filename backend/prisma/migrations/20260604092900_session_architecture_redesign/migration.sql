-- AlterTable
ALTER TABLE "Attribute" RENAME COLUMN "points" TO "value";
ALTER TABLE "Attribute" DROP COLUMN "status";

-- AlterTable
ALTER TABLE "AttributeHistory" DROP COLUMN "reason",
ADD COLUMN     "sessionId" TEXT;

-- AlterTable
ALTER TABLE "JournalEntry" ADD COLUMN     "sessionId" TEXT;

-- AlterTable
ALTER TABLE "Memory" ADD COLUMN     "arcId" TEXT,
ADD COLUMN     "sessionId" TEXT;

-- DropEnum
DROP TYPE "AttributeStatus";

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "closedAt" TIMESTAMP(3),
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Session_userId_date_key" ON "Session"("userId", "date");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JournalEntry" ADD CONSTRAINT "JournalEntry_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttributeHistory" ADD CONSTRAINT "AttributeHistory_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Memory" ADD CONSTRAINT "Memory_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Memory" ADD CONSTRAINT "Memory_arcId_fkey" FOREIGN KEY ("arcId") REFERENCES "Arc"("id") ON DELETE SET NULL ON UPDATE CASCADE;
