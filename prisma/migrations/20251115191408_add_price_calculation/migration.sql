-- AlterTable
ALTER TABLE "public"."ChatSession" ADD COLUMN     "calculatedPrice" DOUBLE PRECISION,
ADD COLUMN     "waitingForPrice" BOOLEAN NOT NULL DEFAULT false;
