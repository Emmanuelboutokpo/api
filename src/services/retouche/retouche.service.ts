
import { differenceInHours } from "date-fns";
import prisma from "../../lib/prisma";
import { createPenalite } from "../penalite/penalite";
import { createAndSendNotification } from "../notification/service";
import { updateRemunerationAfterPenalite } from "../renumeration/remuneration.service";

export async function checkRetouchesNonConformes() {
  const commandes = await prisma.commande.findMany({
    where: { status: "NON_CONFORME" },
    include: { assignedTo: true },
  });

  const now = new Date();

  for (const cmd of commandes) {
    const heuresPassees = differenceInHours(now, cmd.updatedAt);

    if (heuresPassees >= 24) {
      // Crée pénalité 10%
      const penalite = await createPenalite({
        commandeId: cmd.id,
        employeId: cmd.assignedToId!,
        type: "NON_CONFORME",
        montant: (cmd.prix || 0) * 0.1,
        raison: "Retouche non effectuée dans le délai imparti (24h)",
      });

      // Met à jour statut
      await prisma.commande.update({
        where: { id: cmd.id },
        data: { status: "RETOUCHE" },
      });

      // Notification employé
      await createAndSendNotification({
        commandeId: cmd.id,
        destinataireId: cmd.assignedToId!,
        message: `Pénalité 10% pour retouche non effectuée dans les 24h.`,
        type: "PENALITE",
      });

      await updateRemunerationAfterPenalite(cmd.id, penalite.montant);
    }
  }
}
    