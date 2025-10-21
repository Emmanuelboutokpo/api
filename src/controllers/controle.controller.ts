import { getAuth } from "@clerk/express";
import { Request, Response } from "express";
import prisma from "../lib/prisma";
import { createAndSendNotification } from "../services/notification/service";

export const effectuerControle = async (req : Request, res : Response) => {
  const { commandeId } = req.params;
  const { conforme, remarques } = req.body;

  const { userId } = getAuth(req as any);

  try {
    if (!userId) return res.status(401).json({ error: "Not authenticated" });
    const user = await prisma.user.findUnique({ where: { clerkId: userId } });

    if (!user) return res.status(403).json({ error: "User not found in DB" });

  const commande = await prisma.commande.findUnique({ where: { id: commandeId } });
  if (!commande) return res.status(404).json({ error: "Commande introuvable" });

  const controle = await prisma.controle.create({
    data: {
      commandeId,
      controleurId: user.id,
      conforme,
      remarques,
    },
  });

  // Si conforme
  if (conforme) {
    await prisma.commande.update({
      where: { id: commandeId },
      data: { status: "PRET" },
    });

    await createAndSendNotification({
      commandeId,
      destinataireId: commande.assignedToId!,
      message: `Commande ${commandeId} validée et prête à être livrée.`,
      type: "LIVRAISON_PRET",
    });
  } else {
    // Si non conforme
    await prisma.commande.update({
      where: { id: commandeId },
      data: { status: "NON_CONFORME", updatedAt: new Date() },
    });

    await createAndSendNotification({
      commandeId,
      destinataireId: commande.assignedToId!,
      message: `Commande ${commandeId} non conforme, veuillez retoucher sous 24h.`,
      type: "CONTROLE",
    });
  }

  res.json(controle);

  }
catch (error) {
    res.status(500).json({ message: "Erreur lors de la suppression de la commande" });
  }
};
