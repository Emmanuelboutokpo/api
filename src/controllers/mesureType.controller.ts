import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';

export const addMesureType = async (req: Request, res: Response, next: NextFunction) => {
  try {

    const {label } = req.body;

     const existingMeasure = await prisma.mesureType.findFirst({
      where: {
        label,
      },
    });

    if (existingMeasure) {
      return res.status(400).json({
        error: `${label} existe déjà.`,
      });
    }


    const newMesure = await prisma.mesureType.create({
      data: {
        label
      },
    });

    res.status(201).json({ success: true, data: newMesure });
  } catch (error) {
    next(error);
  }
};

export const getMesureType = async (req: Request, res: Response, next: NextFunction) => {
  try {   
    const mesures = await prisma.mesureType.findMany(); 
    res.json({ success: true, data: mesures });
  }
    catch (error) {
    next(error);
    }
};

export const getMesureTypeById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;      
    const mesure = await prisma.mesureType.findUnique({
      where: { id: id},
    }); 
    res.json({ success: true, data: mesure });
  } 
    catch (error) {
    next(error);
    }
};

export const updateMesureType = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { label } = req.body;

    const updated = await prisma.mesureType.update({
      where: { id: id },
      data: { label},
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

export const deleteMesureType = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    await prisma.mesureType.delete({
      where: { id: id },
    });

    res.json({ success: true, message: 'Mesure supprimée du tableau' });
  } catch (error) {
    next(error);
  }
};
