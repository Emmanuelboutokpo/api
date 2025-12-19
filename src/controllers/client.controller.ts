import prisma from "../lib/prisma";
import { Request, Response } from 'express';

// controllers/client.controller.ts
export const getAllClients = async (req: Request, res: Response): Promise<any> => {
    const { page = 1, limit = 10, search, firstName, lastName, telephone } = req.query;
    const pageNumber = Math.max(1, Number(page));
    const limitNumber = Math.min(50, Math.max(1, Number(limit)));
    const skip = (pageNumber - 1) * limitNumber;
    const take = limitNumber;


    // ✅ Recherche globale sur tous les champs
    const filters: any = {};
    
    if (typeof search === 'string' && search.trim().length >= 2) {
        filters.OR = [
            { firstName: { contains: search as string, mode: 'insensitive' } },
            { lastName: { contains: search as string, mode: 'insensitive' } },
            { telephone: { contains: search as string, mode: 'insensitive' } },
            { adresse: { contains: search as string, mode: 'insensitive' } },
        ];
    } else {
        // ✅ Recherche spécifique par champ
        if (firstName) {
            filters.firstName = { contains: firstName as string, mode: 'insensitive' };
        }
        if (lastName) {
            filters.lastName = { contains: lastName as string, mode: 'insensitive' };
        }
        if (telephone) {
            filters.telephone = { contains: telephone as string, mode: 'insensitive' };
        }
    }

    try {
        const [total, clients] = await Promise.all([
            prisma.client.count({ where: filters }),
            prisma.client.findMany({
                where: filters,
                skip,
                take,
                orderBy: { createdAt: 'desc' },
                include: { 
                    mesures: true, 
                    commandes: {
                        select: {
                            id: true,
                            status: true,
                            prix: true
                        }
                    } 
                },
            }),
        ]);

        return res.status(200).json({
            success: true,
            data: clients,
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(total / Number(limit)),
            },
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des clients', error);
        return res.status(500).json({ 
            success: false,
            message: 'Erreur serveur' 
        });
    }
};


export const getClientById = async (req: Request, res: Response) :Promise<any> => {
  const client = await prisma.client.findUnique({ where: { id: req.params.id }, include: { mesures: true, commandes : true }, });
  if (!client) return res.status(404).json({ message: 'Client non trouvée' });
  res.json(client);
};

export const updateClient = async (req: Request, res: Response) => {
 const { firstName, lastName, telephone, adresse } = req.body;
  const updated = await prisma.client.update({
    where: { id: req.params.id },
    data: { firstName, lastName, telephone, adresse },
  });
  res.json(updated);
};

export const deleteClient = async (req: Request, res: Response) => {
  await prisma.client.delete({ where: { id: req.params.id } });
  res.json({ message: 'Client supprimé' });
};
