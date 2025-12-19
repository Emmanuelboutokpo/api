import { Prisma } from "@prisma/client";
import prisma from "../lib/prisma";
import { Request, Response } from 'express';

// controllers/client.controller.ts
export const getAllClients = async (req: Request, res: Response) => {
  const {
    page = 1,
    limit = 10,
    search,
    firstName,
    lastName,
    telephone,
  } = req.query;

  const pageNumber = Math.max(1, Number(page));
  const limitNumber = Math.min(50, Math.max(1, Number(limit)));
  const skip = (pageNumber - 1) * limitNumber;

  const where: any = {};

  const isLiveSearch =
    typeof search === "string" && search.trim().length >= 2;

  try {
  
    if (isLiveSearch) {
      const q = search.trim();

      const clients = await prisma.client.findMany({
        where: {
          OR: [
            { firstName: { startsWith: q, mode: "insensitive" } },
            { lastName: { startsWith: q, mode: "insensitive" } },
            { telephone: { startsWith: q } },
          ],
        },
        take: 8,
        orderBy: { firstName: "asc" },
       include: {
          mesures: { include: { valeurs: { include: { mesureType: { select: { id: true, label: true, unit: true } } } } } },
          commandes: {
            select: {
              id: true,
              status: true,
              prix: true,
            },
          },
        },
      });

      return res.status(200).json({
        success: true,
        mode: "live-search",
        data: clients,
      });
    }

    const filters: Prisma.ClientWhereInput = {};

    if (firstName) {
      filters.firstName = {
        contains: String(firstName),
        mode: "insensitive",
      };
    }

    if (lastName) {
      filters.lastName = {
        contains: String(lastName),
        mode: "insensitive",
      };
    }

    if (telephone) {
      filters.telephone = {
        contains: String(telephone),
      };
    }

    const [total, clients] = await Promise.all([
      prisma.client.count({ where: filters }),
      prisma.client.findMany({
        where: filters,
        skip,
        take: limitNumber,
        orderBy: { createdAt: "desc" },
        include: {
          mesures: { include: { valeurs: { include: { mesureType: { select: { id: true, label: true, unit: true } } } } } },
          commandes: {
            select: {
              id: true,
              status: true,
              prix: true,
            },
          },
        },
      }),
    ]);

    return res.status(200).json({
      success: true,
      mode: "list",
      data: clients,
      pagination: {
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(total / limitNumber),
      },
    });
  } catch (error) {
    console.error("❌ GET CLIENTS ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur serveur",
    });
  }
};

export const getClientById = async (req: Request, res: Response) :Promise<any> => {
  
  const client = await prisma.client.findUnique({ where: { id: req.params.id }, include: {
          mesures: { include: { valeurs: { include: { mesureType: { select: { id: true, label: true, unit: true } } } } } },
          commandes: {
            select: {
              id: true,
              status: true,
              prix: true,
            },
          },
        }, });

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
