import { Request, Response } from "express";
import prisma from "../lib/prisma";
import { cloudinary } from "../lib/cloudinary";
import { getAuth } from "@clerk/express";
import { createAndSendNotification } from "../services/notification/service";
import { validationResult } from "express-validator";

export async function createCommande(req: Request, res: Response) {
  try {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ success: false, errors: errors.array() });
    }
    let bodyData = req.body;
    
    if (req.headers['content-type']?.includes('multipart/form-data')) {
      if (typeof req.body.clientPayload === 'string') {
        bodyData = {
          ...req.body,
          clientPayload: JSON.parse(req.body.clientPayload),
          stylePayload: JSON.parse(req.body.stylePayload)
        };
      }
    }

    const {
      clientId,
      clientPayload,
      dateLivraisonPrevue,
      montantAvance,
      stylePayload,
      styleId,
      description,
      prix,
    } = bodyData; // ✅ Utiliser bodyData au lieu de req.body

    const { userId } = getAuth(req as any);
    if (!userId) return res.status(401).json({ error: "no clerk session" });

    const user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!user) return res.status(403).json({ error: "user not found in DB" });

    // ✅ Convertir les montants en nombres
    const prixNum = Number(prix);
    const montantAvanceNum = Number(montantAvance || 0);

    if (montantAvanceNum > prixNum) {
      return res.status(400).json({ 
        success: false, 
        message: "L'avance ne peut pas dépasser le montant total" 
      });
    }

    let imgCmd: string | null = null;
    let audioFile: string | null = null;

    // ✅ Upload image
    if (req.file) {
      const uploadResult = await cloudinary.uploader.upload(req.file.path, {
        folder: "Latif-client",
        resource_type: "auto",
        timeout: 60000,
      });
      imgCmd = uploadResult.secure_url;
    }

    // ✅ Gérer plusieurs fichiers si nécessaire
    if (req.files) {
      const files = Array.isArray(req.files) ? req.files : Object.values(req.files).flat();
      
      for (const file of files) {
        const uploadResult = await cloudinary.uploader.upload(file.path, {
          folder: "Latif-client",
          resource_type: file.mimetype.startsWith('image/') ? 'image' : 'video',
          timeout: 60000,
        });

        if (file.fieldname === 'imgCmd') {
          imgCmd = uploadResult.secure_url;
        } else if (file.fieldname === 'audioFile') {
          audioFile = uploadResult.secure_url;
        }
      }
    }

    const result = await prisma.$transaction(async (tx) => {
      // 🧍 CLIENT
      let client;
      if (clientId) {
        client = await tx.client.findUnique({ where: { id: clientId } });
        if (!client) throw new Error("Client introuvable");
      } else {
        if (!clientPayload) throw new Error("Client manquant");
        client = await tx.client.create({
          data: {
            firstName: clientPayload.firstName,
            lastName: clientPayload.lastName,
            telephone: clientPayload.telephone,
            adresse: clientPayload.adresse || null,
            gender: clientPayload.gender || "M",
            imageUrl: clientPayload.imageUrl || null,
          },
        });
      }

      // 👔 STYLE
      let style;
      if (styleId) {
        style = await tx.style.findUnique({ where: { id: styleId } });
        if (!style) throw new Error("Style introuvable");
      } else {
        if (!stylePayload) throw new Error("Style manquant");
        try {
          style = await tx.style.create({
            data: { model: stylePayload.model },
          });
        } catch (error: any) {
          if (error.code === "P2002") {
            style = await tx.style.findUnique({
              where: { model: stylePayload.model },
            });
            if (!style) throw new Error("Style déjà existant mais introuvable");
          } else throw error;
        }
      }

      // 👷 Employé disponible
      const employe = await tx.user.findFirst({
        where: { role: "EMPLOYEE", disponibilite: true },
      });
      if (!employe) throw new Error("Aucun employé disponible");

      // 📦 Commande
      const commande = await tx.commande.create({
        data: {
          userId: user.id,
          description,
          prix: prixNum,
          montantAvance: montantAvanceNum,
          dateLivraisonPrevue: new Date(dateLivraisonPrevue),
          clientId: client.id,
          styleId: style.id,
          imgCmd,
          audioFile,
          assignedToId: employe.id,
        },
      });

      // 💰 Paiement initial
      if (montantAvanceNum > 0) {
        await tx.paiement.create({
          data: {
            montant: montantAvanceNum,
            modePaiement: "ESPECES",
            statut: "VALIDE",
            commandeId: commande.id,
            clientId: client.id,
          },
        });
      }

      // 🔔 Notification
      const notif = await tx.notification.create({
        data: {
          commandeId: commande.id,
          message: `Nouvelle commande #${commande.id} (Style: ${style.model}) assignée.`,
          status: "ASSIGNATION",
          destinataireId: employe.id,
        },
      });

      // 🚀 Envoi de la notif temps réel
      await createAndSendNotification({
        commandeId: commande.id,
        message: notif.message,
        destinataireId: employe.id,
      });

      return { commande, client, style };
    });

    return res.status(201).json({
      success: true,
      message: "Commande créée avec succès",
      data: result,
    });
  } catch (err: any) {
    console.error('❌ Erreur création commande:', err);
    res.status(err.status || 500).json({
      success: false,
      message: err.message || "Erreur serveur",
    });
  }
}

 
export const getCommandes = async (req: Request, res: Response) => {
  try {
    const {
      page = '1',
      limit = '10',
      status,
      clientId,
      assignedToId,
      dateFrom,
      dateTo,
      search
    } = req.query;

    const pageNumber = Math.max(1, parseInt(page as string, 10));
    const limitNumber = Math.max(1, parseInt(limit as string, 10));
    const skip = (pageNumber - 1) * limitNumber;

    // ✅ Construction des filtres
    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (clientId) {
      where.clientId = clientId;
    }

    if (assignedToId) {
      where.assignedToId = assignedToId;
    }

    if (dateFrom || dateTo) {
      where.dateCommande = {};
      if (dateFrom) where.dateCommande.gte = new Date(dateFrom as string);
      if (dateTo) where.dateCommande.lte = new Date(dateTo as string);
    }

    if (search) {
      where.OR = [
        { description: { contains: search as string, mode: 'insensitive' } },
        { client: { firstName: { contains: search as string, mode: 'insensitive' } } },
        { client: { lastName: { contains: search as string, mode: 'insensitive' } } },
        { client: { telephone: { contains: search as string, mode: 'insensitive' } } },
        { style: { model: { contains: search as string, mode: 'insensitive' } } },
      ];
    }

    const [commandes, total] = await Promise.all([
      prisma.commande.findMany({
        where,
        skip,
        take: limitNumber,
        include: {
          client: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              telephone: true,
              adresse: true,
              gender: true,
            }
          },
          style: {
            select: {
              id: true,
              model: true,
            }
          },
          assignedTo: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            }
          },
          controleur: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            }
          },
          notifications: {
            select: {
              id: true,
              message: true,
              status: true,
              createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
            take: 5,
          },
          paiements: {
            select: {
              id: true,
              montant: true,
              modePaiement: true,
              statut: true,
              createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
          },
        },
        orderBy: { dateCommande: 'desc' },
      }),
      prisma.commande.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limitNumber);

    res.json({
      success: true,
      data: commandes,
      pagination: {
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages,
        hasNextPage: pageNumber < totalPages,
        hasPrevPage: pageNumber > 1,
      },
    });
  } catch (error) {
    console.error('Erreur récupération commandes:', error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des commandes"
    });
  }
};

export const getCommandeById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const commande = await prisma.commande.findUnique({
      where: { id: id },
      include: { client: true, style : true,  notifications: true },
    });

    if (!commande) return res.status(404).json({ message: "Commande non trouvée" });
    res.json(commande);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération de la commande" });
  }
};

export const updateCommande = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { description, dateLivraisonPrevue, status, prix, montantAvance } = req.body;

  try {
    // ✅ Gestion des fichiers si présents
    let imgCmd, audioFile;

    if (req.files) {
      const files = Array.isArray(req.files) ? req.files : Object.values(req.files).flat();
      
      for (const file of files) {
        const uploadResult = await cloudinary.uploader.upload(file.path, {
          folder: "Latif-commandes",
          resource_type: file.mimetype.startsWith('image/') ? 'image' : 'video',
        });

        if (file.fieldname === 'image') {
          imgCmd = uploadResult.secure_url;
        } else if (file.fieldname === 'audio') {
          audioFile = uploadResult.secure_url;
        }
      }
    }

    const updateData: any = {
      ...(description && { description }),
      ...(dateLivraisonPrevue && { dateLivraisonPrevue: new Date(dateLivraisonPrevue) }),
      ...(status && { status }),
      ...(prix && { prix: Number(prix) }),
      ...(montantAvance && { montantAvance: Number(montantAvance) }),
      ...(imgCmd && { imgCmd }),
      ...(audioFile && { audioFile }),
    };

    const updated = await prisma.commande.update({
      where: { id },
      data: updateData,
      include: {
        client: true,
        style: true,
        assignedTo: true,
        notifications: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        paiements: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    res.json({
      success: true,
      data: updated,
      message: 'Commande mise à jour avec succès'
    });
  } catch (error) {
    console.error('Erreur mise à jour commande:', error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la mise à jour de la commande"
    });
  }
};

export const deleteCommande = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    // ✅ Suppression en cascade dans une transaction
    await prisma.$transaction(async (tx) => {
      // 1. Supprimer les notifications liées
      await tx.notification.deleteMany({
        where: { commandeId: id },
      });

      // 2. Supprimer les paiements liés
      await tx.paiement.deleteMany({
        where: { commandeId: id },
      });

      // 3. Supprimer les contrôles liés
      await tx.controle.deleteMany({
        where: { commandeId: id },
      });

      // 4. Finalement supprimer la commande
      await tx.commande.delete({
        where: { id },
      });
    });

    res.json({
      success: true,
      message: "Commande et données associées supprimées avec succès"
    });
  } catch (error) {
    console.error('Erreur suppression commande:', error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la suppression de la commande"
    });
  }
};

export const acceptCommande = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { userId } = getAuth(req as any);

  try {
    if (!userId) return res.status(401).json({ error: "Not authenticated" });
    const user = await prisma.user.findUnique({ where: { clerkId: userId } });

    if (!user) return res.status(403).json({ error: "User not found in DB" });

    const commande = await prisma.commande.findUnique({ where: { id } });
    if (!commande) return res.status(404).json({ error: "Commande not found" });
    if (commande.assignedToId !== user.id) return res.status(403).json({ error: "Not allowed" });

    const updated = await prisma.commande.update({ where: { id }, data: { status: "EN_COURS" }});

    if (commande.userId) {
      await createAndSendNotification({
        commandeId: id,
        message: `L'employé a accepté la commande ${id}`,
        destinataireId: commande.userId ,
      });
    }

    return res.json(updated);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
};

export const confirmPreparation = async (req: Request, res: Response) => {
  const { id } = req.params; 
 const { userId } = getAuth(req as any);

  try {
    if (!userId) return res.status(401).json({ error: "Not authenticated" });
    const user = await prisma.user.findUnique({ where: { clerkId: userId } });

    if (!user) return res.status(403).json({ error: "User not found in DB" });

    const commande = await prisma.commande.findUnique({ where: { id } });
    if (!commande) return res.status(404).json({ error: "Commande not found" });
    if (commande.assignedToId !== user.id && user.role !== "ADMIN") return res.status(403).json({ error: "Not allowed" });

    const result = await prisma.$transaction(async (tx) => {
      const c = await tx.commande.update({ where: { id }, data: { status: 'MESURE_ENREGISTREE' }});
     
      if (c.userId) {
        await tx.notification.create({
          data: {
            commandeId: id,
            message: `Préparation terminée par ${user.id} pour la commande ${id}`,
            destinataireId: c.userId,
          },
        });
      }
      return c;
    });

    if (commande.userId) {
      await createAndSendNotification({
        commandeId: id,
        message: `Préparation terminée pour la commande ${id}`,
        destinataireId: commande.userId,
      });
    }

    return res.json({ success: true, commande: result });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
};

export const markAsReadyForControl = async (req : Request, res : Response) => {
  const { id } = req.params;  
   const { userId } = getAuth(req as any);

  try {
    if (!userId) return res.status(401).json({ error: "Not authenticated" });
    const user = await prisma.user.findUnique({ where: { clerkId: userId } });

    if (!user) return res.status(403).json({ error: "User not found in DB" });

  const commande = await prisma.commande.findUnique({ where: { id } });
  if (!commande) return res.status(404).json({ error: "Commande introuvable" });
  if (commande.assignedToId !== user.id)
    return res.status(403).json({ error: "Vous n'êtes pas autorisé." });

  const updated = await prisma.commande.update({
    where: { id },
    data: { status: "EN_CONTROLE" },
  });

  const admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
  if (admin) {
    await createAndSendNotification({
      commandeId: commande.id,
      destinataireId: admin.id,
      message: `Commande ${commande.id} prête pour le contrôle.`,
      type: "VALIDATION",
    });
  }
  res.json(updated);
}
catch (error) {
    res.status(500).json({ message: "Erreur lors de la suppression de la commande" });
  }
};

export const assignControleur = async (req : Request, res : Response) => {
  const { commandeId, controleurId } = req.body;
    const { userId } = getAuth(req as any);

  try {
    if (!userId) return res.status(401).json({ error: "Not authenticated" });
    const user = await prisma.user.findUnique({ where: { clerkId: userId } });

    if (!user) return res.status(403).json({ error: "User not found in DB" });

  if (user.role !== "ADMIN") return res.status(403).json({ error: "Accès refusé" });

  const commande = await prisma.commande.update({
    where: { id: commandeId },
    data: { controleurId },
  });

  await createAndSendNotification({
    commandeId,
    destinataireId: controleurId,
    message: `Nouvelle commande à contrôler : ${commande.id}`,
    type: "CONTROLE",
  });

  res.json(commande);
  }
catch (error) {
    res.status(500).json({ message: "Erreur lors de la suppression de la commande" });
  }
};

