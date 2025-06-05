/*
  Warnings:

  - You are about to alter the column `recepiId` on the `Order` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `BigInt`.
  - You are about to alter the column `recipeId` on the `OrderRecipe` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `BigInt`.

*/
-- AlterTable
ALTER TABLE "Order" ALTER COLUMN "recepiId" SET DATA TYPE BIGINT;

-- AlterTable
ALTER TABLE "OrderRecipe" ALTER COLUMN "recipeId" SET DATA TYPE BIGINT;
