-- AlterTable
ALTER TABLE "ProjectImage" DROP COLUMN "data",
ADD COLUMN     "path" TEXT NOT NULL;

