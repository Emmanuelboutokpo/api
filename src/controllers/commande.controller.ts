import { Request, Response } from "express";
 import { differenceInHours } from "date-fns";
import prisma from "../lib/prisma";
import { cloudinary } from "../lib/cloudinary";
import { getAuth } from "@clerk/express";

export const createCommande = async (req: Request, res: Response) => {
 try {
    const { clientId, mesureId, styleId, dateLivraisonPrevue, description, prix} = req.body;
    const { userId } = getAuth(req as any);

    if (!userId) return res.status(401).json({ error: 'no clerk session' });

    const user = await prisma.user.findUnique({ where: { clerkId: userId }});
    if (!user) return res.status(403).json({ error: 'user not found in DB' });

    const livraisonDate = new Date(dateLivraisonPrevue);

     let imgCmd: string | null = null;
     let audioFile: string | null = null;
    
        if (req.file) {
          const uploadResult = await cloudinary.uploader.upload(req.file.path, {
            folder: 'Latif-client',
            resource_type: 'auto',
            timeout: 60000, 
          });
    
          imgCmd = uploadResult.secure_url;
        }
      
        if (audioFile) {
          const uploadResult = await cloudinary.uploader.upload(audioFile, {
            folder: 'Latif-audio',  
            resource_type: 'auto',
            timeout: 60000, 
          });
          audioFile = uploadResult.secure_url;
        }

    const commande = await prisma.commande.create({
      data: {
        clientId,
        mesureId,
        styleId,
        description,
        dateLivraisonPrevue: livraisonDate,
        prix,
        imgCmd,
        audioFile,
        userId: user.id
      }
    });

    // Générer les notifications (J-3, J-2, J-1, J)
    const offsets = [3, 2, 1, 0];
    const notifData = offsets.map(offset => {
      const d = new Date(livraisonDate);
      d.setDate(d.getDate() - offset);
      // n'ajouter que les rappels dans le futur (optionnel)
      if (d.getTime() < Date.now()) return null;
      return {
        commandeId: commande.id,
        message: offset === 0
          ? `Aujourd'hui : livraison prévue pour la commande #${commande.id}`
          : `Rappel : livraison prévue dans ${offset} jour(s) pour la commande #${commande.id}`,
        dateNotification: d
      };
    }).filter(Boolean) as Array<{commandeId:number; message:string; dateNotification:Date}>;

    if (notifData.length > 0) {
      // createMany pour gagner en perf (status prendra la valeur par défaut EN_ATTENTE)
      await prisma.notification.createMany({ data: notifData });
    }

    return res.json({ commande });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'create commande error' });
  }
};

export const getCommandes = async (_req: Request, res: Response) => {
  try {
    const commandes = await prisma.commande.findMany({
      include: { client: true, mesure: true },
      orderBy: { dateCommande: "desc" },
    });
    res.json(commandes);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération des commandes" });
  }
};

export const getCommandeById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const commande = await prisma.commande.findUnique({
      where: { id: Number(id) },
      include: { client: true, mesure: true, notifications: true },
    });

    if (!commande) return res.status(404).json({ message: "Commande non trouvée" });
    res.json(commande);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération de la commande" });
  }
};

export const updateCommande = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { description, dateLivraisonPrevue, status, prix } = req.body;

  try {
    const updated = await prisma.commande.update({
      where: { id: Number(id) },
      data: { description, dateLivraisonPrevue, status, prix },
      include: { client: true, mesure: true },
    });

    // Si le statut change à PRET ou LIVRE → créer une notification
    if (["PRET", "LIVRE"].includes(status)) {
      await prisma.notification.create({
        data: {
          commandeId: updated.id,
          message: `Commande ${status === "PRET" ? "prête" : "livrée"} pour ${updated.client.firstName} ${updated.client.lastName}`,
          dateNotification: new Date(),
        },
      });
    }

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la mise à jour de la commande" });
  }
};

 export const deleteCommande = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    await prisma.commande.delete({ where: { id: Number(id) } });
    res.json({ message: "Commande supprimée avec succès" });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la suppression de la commande" });
  }
};

// ✅ Vérifier et créer des rappels automatiques (à exécuter toutes les X heures)
export const checkLivraisonReminders = async () => {
  const now = new Date();

  const commandes = await prisma.commande.findMany({
    where: {
      status: "EN_COURS",
    },
    include: { client: true },
  });

  for (const commande of commandes) {
    const hoursLeft = differenceInHours(new Date(commande.dateLivraisonPrevue), now);

    if (hoursLeft <= 24 && hoursLeft > 0) {
      const existingNotif = await prisma.notification.findFirst({
        where: {
          commandeId: commande.id,
          message: { contains: "approche" },
        },
      });

      if (!existingNotif) {
        await prisma.notification.create({
          data: {
            commandeId: commande.id,
            message: `⚠️ Livraison de la commande pour ${commande.client.firstName} ${commande.client.lastName} prévue dans ${Math.round(hoursLeft)}h.`,
            dateNotification: new Date(),
          },
        });
      }
    }
  }
};
