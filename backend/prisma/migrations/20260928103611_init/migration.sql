-- CreateEnum
CREATE TYPE "IngredientCategory" AS ENUM ('CRUST', 'SAUCE', 'CHEESE', 'TOPPING');

-- CreateEnum
CREATE TYPE "PizzaSize" AS ENUM ('SMALL', 'MEDIUM', 'LARGE');

-- CreateEnum
CREATE TYPE "FulfillmentType" AS ENUM ('PICKUP', 'DELIVERY');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('RECEIVED', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "Ingredient" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "IngredientCategory" NOT NULL,
    "priceCents" INTEGER NOT NULL,
    "available" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ingredient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "fulfillment" "FulfillmentType" NOT NULL,
    "address" TEXT,
    "notes" TEXT,
    "status" "OrderStatus" NOT NULL DEFAULT 'RECEIVED',
    "totalCents" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderPizza" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "size" "PizzaSize" NOT NULL,
    "label" TEXT NOT NULL,
    "baseCents" INTEGER NOT NULL,
    "lineTotalCents" INTEGER NOT NULL,

    CONSTRAINT "OrderPizza_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderPizzaIngredient" (
    "id" TEXT NOT NULL,
    "orderPizzaId" TEXT NOT NULL,
    "ingredientId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "IngredientCategory" NOT NULL,
    "priceCents" INTEGER NOT NULL,

    CONSTRAINT "OrderPizzaIngredient_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Ingredient_name_key" ON "Ingredient"("name");

-- AddForeignKey
ALTER TABLE "OrderPizza" ADD CONSTRAINT "OrderPizza_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderPizzaIngredient" ADD CONSTRAINT "OrderPizzaIngredient_orderPizzaId_fkey" FOREIGN KEY ("orderPizzaId") REFERENCES "OrderPizza"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderPizzaIngredient" ADD CONSTRAINT "OrderPizzaIngredient_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES "Ingredient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
