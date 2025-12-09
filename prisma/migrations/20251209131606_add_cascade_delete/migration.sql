-- DropForeignKey
ALTER TABLE "public"."CommandeImage" DROP CONSTRAINT "CommandeImage_commandeId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Controle" DROP CONSTRAINT "Controle_commandeId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Fourniture" DROP CONSTRAINT "Fourniture_commandeId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Mesure" DROP CONSTRAINT "Mesure_commandeId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Notification" DROP CONSTRAINT "Notification_commandeId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Paiement" DROP CONSTRAINT "Paiement_commandeId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Penalite" DROP CONSTRAINT "Penalite_commandeId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Remuneration" DROP CONSTRAINT "Remuneration_commandeId_fkey";

-- AddForeignKey
ALTER TABLE "CommandeImage" ADD CONSTRAINT "CommandeImage_commandeId_fkey" FOREIGN KEY ("commandeId") REFERENCES "Commande"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mesure" ADD CONSTRAINT "Mesure_commandeId_fkey" FOREIGN KEY ("commandeId") REFERENCES "Commande"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Fourniture" ADD CONSTRAINT "Fourniture_commandeId_fkey" FOREIGN KEY ("commandeId") REFERENCES "Commande"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Controle" ADD CONSTRAINT "Controle_commandeId_fkey" FOREIGN KEY ("commandeId") REFERENCES "Commande"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Penalite" ADD CONSTRAINT "Penalite_commandeId_fkey" FOREIGN KEY ("commandeId") REFERENCES "Commande"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Remuneration" ADD CONSTRAINT "Remuneration_commandeId_fkey" FOREIGN KEY ("commandeId") REFERENCES "Commande"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_commandeId_fkey" FOREIGN KEY ("commandeId") REFERENCES "Commande"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Paiement" ADD CONSTRAINT "Paiement_commandeId_fkey" FOREIGN KEY ("commandeId") REFERENCES "Commande"("id") ON DELETE CASCADE ON UPDATE CASCADE;
