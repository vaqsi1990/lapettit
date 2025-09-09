/*
  Warnings:

  - You are about to drop the column `allergens` on the `Cake` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Cake` table. All the data in the column will be lost.
  - You are about to drop the column `flavors` on the `Cake` table. All the data in the column will be lost.
  - You are about to drop the column `servings` on the `Cake` table. All the data in the column will be lost.
  - You are about to drop the column `weightKg` on the `Cake` table. All the data in the column will be lost.
  - You are about to drop the `CustomCake` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."CustomCake" DROP CONSTRAINT "CustomCake_orderId_fkey";

-- AlterTable
ALTER TABLE "public"."Cake" DROP COLUMN "allergens",
DROP COLUMN "description",
DROP COLUMN "flavors",
DROP COLUMN "servings",
DROP COLUMN "weightKg",
ADD COLUMN     "age" TEXT,
ADD COLUMN     "creamPrice" DOUBLE PRECISION,
ADD COLUMN     "deliveryDate" TIMESTAMP(3),
ADD COLUMN     "deliveryTime" TEXT,
ADD COLUMN     "fillings" TEXT[],
ADD COLUMN     "hasCream" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "hasMarzipan" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "marzipanPrice" DOUBLE PRECISION,
ADD COLUMN     "pieces" INTEGER,
ADD COLUMN     "piecesPrice" DOUBLE PRECISION,
ADD COLUMN     "quantity" INTEGER,
ALTER COLUMN "price" DROP NOT NULL;

-- DropTable
DROP TABLE "public"."CustomCake";
