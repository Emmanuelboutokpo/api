import prisma from "../../lib/prisma";

export const createPenalite = async ({
  commandeId,
  employeId,
  type,
  montant,
  raison,
}: {
  commandeId: string;
  employeId: string;
  type: "RETARD" | "NON_CONFORME";
  montant: number;
  raison: string;
}) => {
  return prisma.penalite.create({
    data: {
      commandeId,
      employeId,
      montant,
      type,
      raison,
    },
  });
};
