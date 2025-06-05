-- AlterEnum
ALTER TYPE "OrderStatus" ADD VALUE 'PAID';

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "recepiId" INTEGER;

-- CreateTable
CREATE TABLE "OrderRecipe" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "recipeId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrderRecipe_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OrderRecipe_orderId_key" ON "OrderRecipe"("orderId");

-- AddForeignKey
ALTER TABLE "OrderRecipe" ADD CONSTRAINT "OrderRecipe_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
