import prisma from "../lib/prisma";
import { Request, Response } from 'express';

 export const getAllClients = async (req: Request, res: Response): Promise<any> => {
    const { page = 1, limit = 10, firstName, lastName } = req.query; // ✅ Correction: firstName au lieu de firsName
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

     const filters: any = {};
    if (firstName) {
        filters.firstName = { contains: firstName as string, mode: 'insensitive' };  
    }
    if (lastName) {
        filters.lastName = { contains: lastName as string, mode: 'insensitive' };   
    }

    try {
        const [total, clients] = await Promise.all([  
            prisma.client.count({ where: filters }),
            prisma.client.findMany({
                where: filters,
                skip,
                take,
                orderBy: { createdAt: 'desc' },
                include: { mesures: true, commandes: true },
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

// client par ID
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
