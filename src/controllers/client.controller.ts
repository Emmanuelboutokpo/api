import prisma from "../lib/prisma";
import { Request, Response } from 'express';

export const getAllClients = async (req: Request, res: Response) :Promise<any> => {
    const { page = 1, limit = 10, firsName, lastName } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    // Construire les conditions de filtrage
    const filters: any = {};
    if (firsName) {
        filters.firsName = { contains: firsName as string, mode: 'insensitive' };
    }
    if (lastName) {
        filters.lastName = lastName as string;
    }

    try {

        const [clients, total] = await Promise.all([
            prisma.client.count({ where: filters }),
            prisma.client.findMany({
                where: filters,
                skip,
                take,
                orderBy: { createdAt: 'desc' },
                include: { mesures: true, commandes : true },
            }),
        ]);

        return res.status(200).json({
            data: clients,
            pagination: {
                total,
                page: Number(page),
                limit: limit,
            },
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des clients', error);
        return res.status(500).json({ message: 'Erreur serveur' });
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
