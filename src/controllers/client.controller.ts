import { cloudinary } from "../lib/cloudinary";
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

// get client lorsqu'on clique sur le model
export const getClientsByStyle = async (
  req: Request,
  res: Response,
) => {
  try {
    const { model } = req.params;
    const { limit = 10, page = 1, gender, status, search } = req.query;

    const take = Number(limit);
    const skip = (Number(page) - 1) * take;

    const filters: any = {
      styles: {
        some: {
          model: {
            equals: model,
            mode: 'insensitive',
          },
        },
      },
    };

    if (gender && (gender === 'M' || gender === 'F')) {
      filters.gender = gender;
    }

    if (status) {
      filters.commandes = {
        some: {
          status: { equals: status },
        },
      };
    }

    if (search) {
      filters.OR = [
        { firstName: { contains: String(search), mode: 'insensitive' } },
        { lastName: { contains: String(search), mode: 'insensitive' } },
      ];
    }

    // Compter le total avant pagination
    const total = await prisma.client.count({
      where: filters,
    });

    // Récupérer les clients paginés
    const clients = await prisma.client.findMany({
      where: filters,
      include: {
        styles: true,
        commandes: true,
      },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });

    // Calcul de la pagination
    const totalPages = Math.ceil(total / take);

    res.json({
      success: true,
      pagination: {
        total,
        page: Number(page),
        limit: take,
        totalPages,
        hasNextPage: Number(page) < totalPages,
        hasPrevPage: Number(page) > 1,
      },
      count: clients.length,
      data: clients,
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des clients par style', error);
    res.status(500).json({ message: 'Erreur serveur' });
   }
};

// client par ID
export const getClientById = async (req: Request, res: Response) :Promise<any> => {
  const client = await prisma.client.findUnique({ where: { id: parseInt(req.params.id) }, include: { mesures: true, commandes : true }, });
  if (!client) return res.status(404).json({ message: 'Client non trouvée' });
  res.json(client);
};

//route de la page d'accueil
export const getClientsGroupedByStyle = async (req: Request, res: Response) => {
  try {
    // 🔹 Récupération de tous les styles avec leurs clients associés
    const styles = await prisma.style.findMany({
      include: {
        clients: true, // ✅ N:N relation
      },
    });

    // 🔹 On groupe les clients par modèle de style
    const grouped = styles.reduce((acc: any, style: { model: string; clients: any[] }) => {
      const model = style.model;

      if (!acc[model]) {
        acc[model] = [];
      }

      // Ajout des clients du style actuel
      style.clients.forEach((client) => {
        const exists = acc[model].some((c: any) => c.id === client.id);
        if (!exists) {
          acc[model].push(client);
        }
      });

      return acc;
    }, {});

    // 🔹 On limite à 4 clients par style
    const limited = Object.entries(grouped).map(([model, clients]: [string, any]) => ({
      model,
      clients: clients.slice(0, 4), // max 4 clients
    }));

    res.json({ success: true, data: limited });
  } catch (error) {
    console.error("Erreur lors de la récupération des clients groupés par style", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};


 export const createClient = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, telephone, adresse, gender } = req.body;

    if (!firstName || !lastName) {
      return res.status(400).json({ error: "firstName and lastName are required" });
    }

    const existingClient = await prisma.client.findFirst({
      where: {
        firstName,
        lastName,
      },
    });

    if (existingClient) {
      return res.status(400).json({
        error: `Le client ${firstName} ${lastName} existe déjà.`,
      });
    }

    let imageUrl: string | null = null;

    if (req.file) {
      const uploadResult = await cloudinary.uploader.upload(req.file.path, {
        folder: 'Latif-client',
        resource_type: 'auto',
        timeout: 60000, 
      });

      imageUrl = uploadResult.secure_url;
    }
    // Création si pas trouvé
    const newClient = await prisma.client.create({
      data: {
        firstName,
        lastName,
        telephone,
        adresse,
        gender,
        imageUrl
      },
    });

    return res.status(201).json(newClient);
  } catch (error: any) {
    console.error("Erreur création client:", error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
};

export const updateClient = async (req: Request, res: Response) => {
 const { firstName, lastName, telephone, adresse } = req.body;
  const updated = await prisma.client.update({
    where: { id: parseInt(req.params.id) },
    data: { firstName, lastName, telephone, adresse },
  });
  res.json(updated);
};

export const deleteClient = async (req: Request, res: Response) => {
  await prisma.client.delete({ where: { id: parseInt(req.params.id) } });
  res.json({ message: 'Client supprimé' });
};
