/*
  Warnings:

  - You are about to drop the column `valeur` on the `MesureType` table. All the data in the column will be lost.
  - Added the required column `valeur` to the `MesureValeur` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MesureType" DROP COLUMN "valeur";

-- AlterTable
ALTER TABLE "MesureValeur" ADD COLUMN     "valeur" DOUBLE PRECISION NOT NULL;
