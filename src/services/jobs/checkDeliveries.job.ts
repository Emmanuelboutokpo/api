import cron from "node-cron";
import { differenceInDays, differenceInHours } from "date-fns";
import prisma from "../../lib/prisma";
import { createAndSendNotification } from "../notification/service";
import { createPenalite } from "../penalite/penalite";
import { checkRetouchesNonConformes } from "../retouche/retouche.service";

export const startCheckDeliveriesJob = () => {
   console.log("🕓 Cron démarré : suivi des commandes...");

  cron.schedule("0 0 * * *", async () => {
    const today = new Date();

    const commandes = await prisma.commande.findMany({
      where: { NOT: { status: "LIVRE" } },
      include: { assignedTo: true },
    });

    for (const commande of commandes) {
      const diff = differenceInDays(commande.dateLivraisonPrevue, today);

      // --- 🟡 RAPPELS DE LIVRAISON ---
      if ([2, 1, 0].includes(diff) && commande.assignedToId) {
        await createAndSendNotification({
          commandeId: commande.id,
          destinataireId: commande.assignedToId,
          message: `Rappel : Livraison de la commande ${commande.description} prévue dans ${diff} jour(s).`,
          type: "RAPPEL_LIVRAISON",
        });
      }

      // --- 🔴 RETARD +3 JOURS ---
      if (diff < -3 && commande.assignedToId) {
        // Créer une pénalité
         await prisma.penalite.create({
          data: {
            commandeId: commande.id,
            employeId: commande.assignedToId,
            type: "RETARD",
            montant: (commande.prix || 0) * 0.2,
            raison: "Retard supérieur à 3 jours sur la livraison.",
          },
        });

        // Mettre à jour la commande
        await prisma.commande.update({
          where: { id: commande.id },
          data: { status: "RETARD" },
        });

        // Notification
        await createAndSendNotification({
          commandeId: commande.id,
          destinataireId: commande.assignedToId,
          message: `Une pénalité de 20% a été appliquée pour retard.`,
          type: "PENALITE",
        });
      }

      // --- 🧩 RETOUCHE NON FAITE APRÈS 24H ---
      await checkRetouchesNonConformes();
    }

    console.log("✅ Cron terminé : suivi des livraisons et pénalités effectué.");
  });
};
