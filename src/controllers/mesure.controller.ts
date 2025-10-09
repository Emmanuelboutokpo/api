import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';

export const createMesure = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { clientId, tableauDeMesures } = req.body;

    const mesure = await prisma.mesure.create({
      data: {
        clientId,
        tableauDeMesures: {
          create: tableauDeMesures,
        },
      },
      include: { tableauDeMesures: true },
    });

    res.status(201).json({ success: true, data: mesure });
  } catch (error) {
    next(error);
  }
};

export const getMesuresByClient = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { clientId } = req.params;

    const mesures = await prisma.mesure.findMany({
      where: { clientId: Number(clientId) },
      include: { tableauDeMesures: true },
    });

    res.json({ success: true, data: mesures });
  } catch (error) {
    next(error);
  }
};

export const getMesures = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const mesures = await prisma.mesure.findMany({
      include: { tableauDeMesures: true },
    });

    res.json({ success: true, data: mesures });
  } catch (error) {
    next(error);
  }
};

export const getMesuresById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const mesures = await prisma.mesure.findFirst({
    where: { id: Number(id) },
      include: { tableauDeMesures: true },
    });

    res.json({ success: true, data: mesures });
  } catch (error) {
    next(error);
  }
};

export const deleteMesureManuel = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    await prisma.mesure.delete({
      where: { id: Number(id) },
    });

    res.json({ success: true, message: 'Mesure supprimée avec succès' });
  } catch (error) {
    next(error);
  }
};
