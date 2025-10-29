import { Request, Response } from 'express';
import prisma from '../lib/prisma';

// controllers/user.controller.ts
export const getUsers = async (req: Request, res: Response): Promise<void> => {
  const { 
    page = '1', 
    limit = '10', 
    role, 
    search,
    disponibilite 
  } = req.query;

  const pageNumber = Math.max(1, parseInt(page as string, 10));
  const limitNumber = Math.max(1, parseInt(limit as string, 10));
  const skip = (pageNumber - 1) * limitNumber;

  try {
    // ✅ Construire les filtres
    const where: any = {};

    // ✅ Filtre par rôle
    if (role && ['ADMIN', 'EMPLOYEE', 'CONTROLLEUR'].includes(role as string)) {
      where.role = role;
    }

    // ✅ Filtre par disponibilité
    if (disponibilite !== undefined) {
      where.disponibilite = disponibilite === 'true';
    }

    // ✅ Recherche globale (nom, prénom, email)
    if (search) {
      where.OR = [
        { firstName: { contains: search as string, mode: 'insensitive' } },
        { lastName: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    // ✅ Récupérer les utilisateurs avec pagination
    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limitNumber,
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          clerkId: true,
          role: true,
          img: true,
          disponibilite: true,
          createdAt: true,
          _count: {
            select: {
              commandesAssignees: true,
              commandesControlees: true,
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    // ✅ Calculer la pagination
    const totalPages = Math.ceil(totalCount / limitNumber);
    const hasNextPage = pageNumber < totalPages;
    const hasPrevPage = pageNumber > 1;

    res.json({
      success: true,
      data: users,
      pagination: {
        total: totalCount,
        page: pageNumber,
        limit: limitNumber,
        totalPages,
        hasNextPage,
        hasPrevPage,
      },
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erreur lors de la récupération des utilisateurs' 
    });
  }
};
 
export const createOrUpdate = async (req: Request, res: Response): Promise<void> => {
  const { clerkId, email, firstName, lastName, img } = req.body; 

  if (!clerkId || !email || !firstName || !lastName) {
    res.status(400).json({ message: 'Missing required fields' });
    return;
  }

  try {
    // ✅ Vérifier si le user existe déjà
    let user = await prisma.user.findFirst({
      where: {
        OR: [{ clerkId }, { email }],
      },
    });

    // ✅ Créer ou mettre à jour
    if (!user) {
      user = await prisma.user.upsert({
        where: { clerkId },
        update: {
          firstName: firstName || '',
          lastName: lastName,
          email: email || '',
          img: img || null,
        },
        create: {
          clerkId,
          email,
          firstName,
          lastName,
          img: img || null,
          role: 'EMPLOYEE',
        },
      });
    }

    res.status(201).json({ success: true, data: user });
  } catch (err) {
    console.error('Error creating/updating user:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getUser = async (req: Request, res: Response): Promise<void> => {
  const { clerkId } = req.params;
  try {
    const user = await prisma.user.findFirst({ where : {clerkId} });
   
    if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
    }
    res.status(200).json({ success: true, user });
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// controllers/user.controller.ts
export const getEmployeesAndControleurs = async (req: Request, res: Response): Promise<void> => {
  const { 
    disponibilite,
    search 
  } = req.query;

  try {
    // ✅ Filtre pour employés et contrôleurs seulement
    const where: any = {
      role: {
        in: ['EMPLOYEE', 'CONTROLLEUR'],
      },
    };

    // ✅ Filtre par disponibilité
    if (disponibilite !== undefined) {
      where.disponibilite = disponibilite === 'true';
    }

    // ✅ Recherche
    if (search) {
      where.OR = [
        { firstName: { contains: search as string, mode: 'insensitive' } },
        { lastName: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      orderBy: {
        role: 'asc', // ✅ Trier par rôle
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        img: true,
        disponibilite: true,
        
      },
    });

    res.json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error('Error fetching employees and controleurs:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erreur lors de la récupération des employés et contrôleurs' 
    });
  }
};
