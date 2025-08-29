/*
  Warnings:

  - Added the required column `customerEmail` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
-- First add the column as nullable
ALTER TABLE "public"."Order" ADD COLUMN "customerEmail" TEXT;

-- Update existing records with a default email
UPDATE "public"."Order" SET "customerEmail" = 'customer@example.com' WHERE "customerEmail" IS NULL;

-- Now make the column required
ALTER TABLE "public"."Order" ALTER COLUMN "customerEmail" SET NOT NULL;
