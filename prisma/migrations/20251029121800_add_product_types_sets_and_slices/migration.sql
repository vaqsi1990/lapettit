-- CreateEnum
CREATE TYPE "public"."ProductType" AS ENUM ('FULL_CAKE', 'SET', 'INDIVIDUAL_SLICE');

-- AlterTable
ALTER TABLE "public"."Cake" ADD COLUMN     "productType" "public"."ProductType" NOT NULL DEFAULT 'FULL_CAKE',
ADD COLUMN     "setDescription" TEXT,
ADD COLUMN     "setItems" TEXT[],
ADD COLUMN     "sliceDescription" TEXT,
ADD COLUMN     "sliceWeight" TEXT;
