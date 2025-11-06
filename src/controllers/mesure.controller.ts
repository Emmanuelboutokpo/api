import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { getAuth } from '@clerk/express';
import { createAndSendNotification } from '../services/notification/service';

export const createMesureByOrder = async (req: Request, res: Response) => {
  try {
    const { commandeId } = req.params;
    const {clientId, valeurs } = req.body;
    const { userId } = getAuth(req as any);

    if (!userId) return res.status(401).json({ error: "Not authenticated" });
    const user = await prisma.user.findUnique({ where: { clerkId: userId } });

    if (!user) return res.status(403).json({ error: "User not found in DB" });

    const commande = await prisma.commande.findUnique({ where: { id: commandeId } });
    if (!commande) return res.status(404).json({ error: "Commande not found" });

    const isAssigned = commande.assignedToId === user.id;
    if (!isAssigned && user.role !== "ADMIN") {
      return res.status(403).json({ error: "Not allowed to add measures on this order" });
    }

     const measures = await prisma.mesure.create({
      data: {
        commandeId,
        clientId,
        valeurs: {
          create: valeurs.map((v:any) => ({
            mesureTypeId: v.mesureTypeId,
            valeur: v.valeur,
          })),
        },
      },
      include: { valeurs: { include: { mesureType: true } } },
    });

    res.status(201).json({ success: true, data: measures });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
};

export const getMesuresByOrder = async (req: Request, res: Response) => {
  const { commandeId } = req.params;
  const { userId } = getAuth(req as any);
  try {
     if (!userId) return res.status(401).json({ error: "Not authenticated" });
     const user = await prisma.user.findUnique({ where: { clerkId: userId } });

     if (!user) return res.status(403).json({ error: "User not found in DB" });

    const commande = await prisma.commande.findUnique({ where: { id: commandeId } });
    if (!commande) return res.status(404).json({ error: "Commande not found" });

    if (user.role !== "ADMIN" && commande.assignedToId !== user.id) {
      return res.status(403).json({ error: "Not allowed" });
    }

    const mesures = await prisma.mesure.findMany({
  where: { commandeId },
  include: {
    valeurs: {
      include: { mesureType: true },
    },
  },
});
    return res.json(mesures);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
};

export const updateMesureByOrder = async (req: Request, res: Response) => {
   const { id } = req.params;
   const { userId } = getAuth(req as any);
   const { valeurs } = req.body;

  try {
    
    if (!userId) return res.status(401).json({ error: "Not authenticated" });
     const user = await prisma.user.findUnique({ where: { clerkId: userId } });

     if (!user) return res.status(403).json({ error: "User not found in DB" });
    
    if (!valeurs || !Array.isArray(valeurs) || valeurs.length === 0) {
      return res.status(400).json({ success: false, message: "valeurs est requis et doit être un tableau" });
    }

    
    const mesureExists = await prisma.mesure.findUnique({ where: { id: id } });
    if (!mesureExists) {
      return res.status(404).json({ success: false, message: "Mesure non trouvée" });
    }

    const commande = await prisma.commande.findUnique({ where: { id: mesureExists.commandeId } });
   if (!commande) return res.status(404).json({ error: "Commande not found" });

   if (user.role !== "ADMIN" && commande.assignedToId !== user.id) return res.status(403).json({ error: "Not allowed" });

    await Promise.all(
      valeurs.map(async (v) => {
        if (!v.id) return; 
        await prisma.mesureValeur.update({
          where: { id: v.id },
          data: { valeur: v.valeur },
        });
      })
    );

    const updated = await prisma.mesure.findUnique({
      where: { id: id },
      include: {
        valeurs: { include: { mesureType: true } },
      },
    });

    res.status(200).json({
      success: true,
      message: "Mesure mise à jour avec succès ✅",
      data: updated,
    });


  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
};

export const deleteMesureByOrder = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { userId } = getAuth(req as any);
   
  if (!userId) return res.status(401).json({ error: "Not authenticated" });
     const user = await prisma.user.findUnique({ where: { clerkId: userId } });

     if (!user) return res.status(403).json({ error: "User not found in DB" });
  try {
    const mesure = await prisma.mesure.findUnique({ where: { id } });
    if (!mesure) return res.status(404).json({ error: "Mesure not found" });

    const commande = await prisma.commande.findUnique({ where: { id: mesure.commandeId } });
    if (!commande) return res.status(404).json({ error: "Commande not found" });

    if (user.role !== "ADMIN" && commande.assignedToId !== user.id) return res.status(403).json({ error: "Not allowed" });

    await prisma.mesure.delete({ where: { id } });
    return res.json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
};
