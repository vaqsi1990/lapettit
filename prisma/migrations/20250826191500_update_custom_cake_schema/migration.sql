/*
  Warnings:

  - You are about to drop the column `size` on the `CustomCake` table. All the data in the column will be lost.
  - Added the required column `deliveryDate` to the `CustomCake` table without a default value. This is not possible if the table is not empty.
  - Added the required column `design` to the `CustomCake` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quantity` to the `CustomCake` table without a default value. This is not possible if the table is not empty.
  - Made the column `flavor` on table `CustomCake` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."CustomCake" DROP COLUMN "size",
ADD COLUMN     "decorations" TEXT[],
ADD COLUMN     "deliveryDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "deliveryTime" TEXT,
ADD COLUMN     "design" TEXT NOT NULL,
ADD COLUMN     "filling" TEXT,
ADD COLUMN     "glaze" TEXT,
ADD COLUMN     "quantity" INTEGER NOT NULL,
ADD COLUMN     "shape" TEXT,
ALTER COLUMN "flavor" SET NOT NULL;
