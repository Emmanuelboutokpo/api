/*
  Warnings:

  - You are about to drop the column `imgModel` on the `Commande` table. All the data in the column will be lost.
  - You are about to drop the column `imgTissu` on the `Commande` table. All the data in the column will be lost.
  - You are about to drop the column `imgModel` on the `Style` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "ImageType" AS ENUM ('MODEL', 'TISSU');

-- AlterTable
ALTER TABLE "Commande" DROP COLUMN "imgModel",
DROP COLUMN "imgTissu";

-- AlterTable
ALTER TABLE "Style" DROP COLUMN "imgModel";

-- CreateTable
CREATE TABLE "CommandeImage" (
    "id" TEXT NOT NULL,
    "type" "ImageType" NOT NULL,
    "url" TEXT NOT NULL,
    "commandeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommandeImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StyleImage" (
    "id" TEXT NOT NULL,
    "type" "ImageType" NOT NULL,
    "url" TEXT NOT NULL,
    "styleId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StyleImage_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CommandeImage" ADD CONSTRAINT "CommandeImage_commandeId_fkey" FOREIGN KEY ("commandeId") REFERENCES "Commande"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StyleImage" ADD CONSTRAINT "StyleImage_styleId_fkey" FOREIGN KEY ("styleId") REFERENCES "Style"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
