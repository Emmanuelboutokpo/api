import { Request, Response } from "express";
import prisma from "../lib/prisma";
import { getAuth } from "@clerk/express";
import { createAndSendNotification } from "../services/notification/service";


export const createFourniture = async (req: Request, res: Response) => {
  const { commandeId } = req.params;
  const { designation, quantite } = req.body;
  const { userId } = getAuth(req as any);

  if (!userId) return res.status(401).json({ error: "Not authenticated" });
  const user = await prisma.user.findUnique({ where: { clerkId: userId } });

    if (!user) return res.status(403).json({ error: "User not found in DB" });
  try {
    const commande = await prisma.commande.findUnique({ where: { id: commandeId } });
    if (!commande) return res.status(404).json({ error: "Commande not found" });

    if (user.role !== "ADMIN" && commande.assignedToId !== user.id) return res.status(403).json({ error: "Not allowed" });

    const fourniture = await prisma.fourniture.create({
      data: { commandeId, designation, quantite: Number(quantite)},
    });

    if (commande.userId) {
      await createAndSendNotification({
        commandeId,
        message: `Fourniture "${designation}" ajoutée à la commande ${commandeId}`,
        destinataireId: commande.userId,
      });
    }

    return res.status(201).json(fourniture);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
};

export const getFournitures = async (req: Request, res: Response) => {
  const { commandeId } = req.params;
    const { userId } = getAuth(req as any);

    try {
      if (!userId) return res.status(401).json({ error: "Not authenticated" });
      const user = await prisma.user.findUnique({ where: { clerkId: userId } });
    
        if (!user) return res.status(403).json({ error: "User not found in DB" });
    const commande = await prisma.commande.findUnique({ where: { id: commandeId } });
    if (!commande) return res.status(404).json({ error: "Commande not found" });

    if (user.role !== "ADMIN" && commande.assignedToId !== user.id) return res.status(403).json({ error: "Not allowed" });

    const fournis = await prisma.fourniture.findMany({ where: { commandeId } });
    return res.json(fournis);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
};

export const updateFourniture = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { designation, quantite, statut } = req.body;
    const { userId } = getAuth(req as any);

    try {
        if (!userId) return res.status(401).json({ error: "Not authenticated" });
        const user = await prisma.user.findUnique({ where: { clerkId: userId } });
      
          if (!user) return res.status(403).json({ error: "User not found in DB" });
        const fourniture = await prisma.fourniture.findUnique({ where: { id } });
    if (!fourniture) return res.status(404).json({ error: "Fourniture not found" });

    const commande = await prisma.commande.findUnique({ where: { id: fourniture.commandeId } });
    if (!commande) return res.status(404).json({ error: "Commande not found" });

    if (user.role !== "ADMIN" && commande.assignedToId !== user.id) return res.status(403).json({ error: "Not allowed" });

    const updated = await prisma.fourniture.update({ where: { id }, data: { designation, quantite: Number(quantite)} });
    return res.json(updated);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
};

export const deleteFourniture = async (req: Request, res: Response) => {
  const { id } = req.params;
    const { userId } = getAuth(req as any);
    try {
      
        if (!userId) return res.status(401).json({ error: "Not authenticated" });
        const user = await prisma.user.findUnique({ where: { clerkId: userId } });
      
          if (!user) return res.status(403).json({ error: "User not found in DB" });
    const fourniture = await prisma.fourniture.findUnique({ where: { id } });
    if (!fourniture) return res.status(404).json({ error: "Fourniture not found" });

    const commande = await prisma.commande.findUnique({ where: { id: fourniture.commandeId } });
    if (!commande) return res.status(404).json({ error: "Commande not found" });

    if (user.role !== "ADMIN" && commande.assignedToId !== user.id) return res.status(403).json({ error: "Not allowed" });

    await prisma.fourniture.delete({ where: { id } });
    return res.json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
};
