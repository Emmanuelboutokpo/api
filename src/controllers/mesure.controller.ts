import prisma from "../lib/prisma";

export async function getMesuresByClient(clientId: number) {
  return prisma.mesure.findMany({
    where: { clientId },
    include: {
      valeurs: { include: { mesureType: true} },
    },
    orderBy: { createdAt: 'desc' },
  });
}


