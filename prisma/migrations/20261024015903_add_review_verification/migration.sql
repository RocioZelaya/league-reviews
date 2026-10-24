-- AlterTable
ALTER TABLE "Comment" ADD COLUMN     "reviewerPuuid" TEXT,
ADD COLUMN     "verifiedMatchId" TEXT,
ADD COLUMN     "verifiedMatchPlayedAt" TIMESTAMP(3);
