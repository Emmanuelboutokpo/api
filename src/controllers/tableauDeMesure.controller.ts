import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';

export const addMesureToTableau = async (req: Request, res: Response, next: NextFunction) => {
  try {

    const {mesureId, label, valeur } = req.body;

    const newMesure = await prisma.tableauDeMesure.create({
      data: {
        label,
        valeur,
        mesureId: Number(mesureId),
      },
    });

    res.status(201).json({ success: true, data: newMesure });
  } catch (error) {
    next(error);
  }
};

export const getMesureTableau = async (req: Request, res: Response, next: NextFunction) => {
  try {   
    const mesures = await prisma.tableauDeMesure.findMany(); 
    res.json({ success: true, data: mesures });
  }
    catch (error) {
    next(error);
    }
};

export const getMesureTableauById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;      
    const mesure = await prisma.tableauDeMesure.findUnique({
      where: { id: Number(id) },
    }); 
    res.json({ success: true, data: mesure });
  } 
    catch (error) {
    next(error);
    }
};

export const updateMesureTableau = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { label, valeur } = req.body;

    const updated = await prisma.tableauDeMesure.update({
      where: { id: Number(id) },
      data: { label, valeur },
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

export const deleteMesureTableau = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    await prisma.tableauDeMesure.delete({
      where: { id: Number(id) },
    });

    res.json({ success: true, message: 'Mesure supprimée du tableau' });
  } catch (error) {
    next(error);
  }
};
