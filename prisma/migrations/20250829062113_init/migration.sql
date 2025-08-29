-- CreateEnum
CREATE TYPE "public"."CakeCategory" AS ENUM ('BIRTHDAY', 'WEDDING', 'ANNIVERSARY', 'CUSTOM', 'Desserts');

-- CreateTable
CREATE TABLE "public"."Cake" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "imageUrl" TEXT,
    "category" "public"."CakeCategory" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Cake_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CustomCake" (
    "id" SERIAL NOT NULL,
    "design" TEXT NOT NULL,
    "flavor" TEXT NOT NULL,
    "filling" TEXT,
    "glaze" TEXT,
    "shape" TEXT,
    "decorations" TEXT[],
    "text" TEXT,
    "quantity" INTEGER NOT NULL,
    "deliveryDate" TIMESTAMP(3) NOT NULL,
    "deliveryTime" TEXT,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "orderId" INTEGER NOT NULL,

    CONSTRAINT "CustomCake_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Order" (
    "id" SERIAL NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerPhone" TEXT NOT NULL,
    "customerEmail" TEXT,
    "address" TEXT NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "bogOrderId" TEXT,
    "paidAt" TIMESTAMP(6),
    "isPaid" BOOLEAN NOT NULL DEFAULT false,
    "isDelivered" BOOLEAN NOT NULL DEFAULT false,
    "deliveredAt" TIMESTAMP(6),
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."OrderItem" (
    "id" SERIAL NOT NULL,
    "orderId" INTEGER NOT NULL,
    "cakeId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CustomCake_orderId_key" ON "public"."CustomCake"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "Order_bogOrderId_key" ON "public"."Order"("bogOrderId");

-- AddForeignKey
ALTER TABLE "public"."CustomCake" ADD CONSTRAINT "CustomCake_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "public"."Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "public"."Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OrderItem" ADD CONSTRAINT "OrderItem_cakeId_fkey" FOREIGN KEY ("cakeId") REFERENCES "public"."Cake"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
