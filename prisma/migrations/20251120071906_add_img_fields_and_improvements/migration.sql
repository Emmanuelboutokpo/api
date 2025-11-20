/*
  Warnings:

  - You are about to drop the column `imgCmd` on the `Commande` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Commande" DROP COLUMN "imgCmd",
ADD COLUMN     "imgModel" TEXT,
ADD COLUMN     "imgTissu" TEXT;

-- AlterTable
ALTER TABLE "Style" ADD COLUMN     "imgModel" TEXT;
