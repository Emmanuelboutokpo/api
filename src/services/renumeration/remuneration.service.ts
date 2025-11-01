import prisma from "../../lib/prisma";

export const generateRemuneration = async (commandeId: string) => {
  const commande = await prisma.commande.findUnique({
    where: { id: commandeId },
    include: { assignedTo: true, penalites: true },
  });

  if (!commande) throw new Error("Commande introuvable");
  if (!commande.assignedToId) throw new Error("Aucun employé assigné à la commande");
  if (!commande.prix) throw new Error("Le prix de la commande est manquant");

  const penalites = commande.penalites?.reduce((acc, p) => acc + p.montant, 0) ?? 0;
  const base = commande.prix * 0.4;
  const montantFinal = Math.max(base - penalites, 0); // évite un montant négatif

  await prisma.remuneration.create({
    data: {
      employeId: commande.assignedToId,
      commandeId: commande.id,
      montant: montantFinal,
    },
  });

  return montantFinal;
};


export async function updateRemunerationAfterPenalite(commandeId: string, montantPenalite: number) {
  const remuneration = await prisma.remuneration.findFirst({ where: { commandeId } });
  if (!remuneration) return;

  const nouveauMontant = remuneration.montant - montantPenalite;

  await prisma.remuneration.update({
    where: { id: remuneration.id },
    data: { montant: nouveauMontant },
  });
}