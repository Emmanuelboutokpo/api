import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';

export const getMesuresByClient = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { clientId } = req.params;

    const mesures = await prisma.mesure.findMany({
      where: { clientId: parseInt(clientId) },
      include: {
        valeurs: { include: { mesureType: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: mesures });
  }
  catch (error) {
    next(error);
  }
}

export const createMesure = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { clientId, valeurs } = req.body;

    if (!clientId || !Array.isArray(valeurs)) {
      return res.status(400).json({ message: "clientId et valeurs sont requis" });
    }

    // ✅ Création d’une mesure + valeurs associées
    const mesure = await prisma.mesure.create({
      data: {
        clientId,
        valeurs: {
          create: valeurs.map(v => ({
            mesureTypeId: v.mesureTypeId,
            valeur: v.valeur,
          })),
        },
      },
      include: { valeurs: { include: { mesureType: true } } },
    });

    res.status(201).json({ success: true, data: mesure });
  } catch (error) {
    next(error);
  }
};

export const updateMesure = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { valeurs } = req.body;
    const mesureId = parseInt(id);

    if (!valeurs || !Array.isArray(valeurs) || valeurs.length === 0) {
      return res.status(400).json({ success: false, message: "valeurs est requis et doit être un tableau" });
    }

    const mesureExists = await prisma.mesure.findUnique({ where: { id: mesureId } });
    if (!mesureExists) {
      return res.status(404).json({ success: false, message: "Mesure non trouvée" });
    }

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
      where: { id: mesureId },
      include: {
        valeurs: { include: { mesureType: true } },
      },
    });

    res.status(200).json({
      success: true,
      message: "Mesure mise à jour avec succès ✅",
      data: updated,
    });
  } catch (error) {
    console.error("Erreur updateMesure:", error);
    next(error);
  }
};


export const deleteMesure = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    await prisma.mesureValeur.deleteMany({ where: { mesureId: parseInt(id) } });

    await prisma.mesure.delete({ where: { id: parseInt(id) } });

    res.json({ success: true, message: "Mesure supprimée avec succès" });
  } catch (error) {
    next(error);
  }
};



