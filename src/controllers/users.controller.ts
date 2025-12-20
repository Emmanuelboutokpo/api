import { Request, Response } from 'express';
import prisma from '../lib/prisma';

// controllers/user.controller.ts
export const getUsers = async (req: Request, res: Response): Promise<void> => {
  const {
    page = '1',
    limit = '10',
    role,
    search,
    disponibilite,
  } = req.query;

  const pageNumber = Math.max(1, parseInt(page as string, 10));
  const limitNumber = Math.min(50, Math.max(1, parseInt(limit as string, 10)));
  const skip = (pageNumber - 1) * limitNumber;

  try {
    const where: any = {};

    // ✅ Filtre par rôle
    if (role) {
      if (Array.isArray(role)) {
        where.role = { in: role };
      } else {
        where.role = role;
      }
    }

    // ✅ Filtre par disponibilité
    if (disponibilite !== undefined) {
      where.disponibilite = disponibilite === 'true';
    }

    // ✅ Recherche globale (User + Profile)
    if (search && typeof search === 'string' && search.trim().length >= 1) {
      where.OR = [
        {
          email: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          profile: {
            is: {
              firstName: {
                contains: search,
                mode: 'insensitive',
              },
            },
          },
        },
        {
          profile: {
            is: {
              lastName: {
                contains: search,
                mode: 'insensitive',
              },
            },
          },
        },
      ];
    }

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
          email: true,
          role: true,
          disponibilite: true,
          createdAt: true,
          profile: {
            select: {
              firstName: true,
              lastName: true,
              img: true,
            },
          },
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

    const totalPages = Math.ceil(totalCount / limitNumber);

    res.json({
      success: true,
      data: users,
      pagination: {
        total: totalCount,
        page: pageNumber,
        limit: limitNumber,
        totalPages,
        hasNextPage: pageNumber < totalPages,
        hasPrevPage: pageNumber > 1,
      },
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des utilisateurs',
    });
  }
};


// controllers/user.controller.ts
export const updateUser = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { firstName, lastName, email, role, disponibilite, img } = req.body;

  try {
    // ✅ Vérifier si l'utilisateur existe
    const existingUser = await prisma.user.findUnique({
      where: { id },
      include: { profile: true },
    });

    if (!existingUser) {
      res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé',
      });
      return;
    }

    // ✅ Construire la mise à jour du profile si nécessaire
    const profileData =
      firstName !== undefined ||
      lastName !== undefined ||
      img !== undefined
        ? {
            update: {
              ...(firstName !== undefined && { firstName }),
              ...(lastName !== undefined && { lastName }),
              ...(img !== undefined && { img }),
            },
          }
        : undefined;

    // ✅ Mise à jour de l'utilisateur
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...(email !== undefined && { email }),
        ...(role !== undefined && { role }),
        ...(disponibilite !== undefined && { disponibilite }),
        ...(profileData && { profile: profileData }),
      },
      select: {
        id: true,
        email: true,
        role: true,
        disponibilite: true,
        createdAt: true,
        profile: {
          select: {
            firstName: true,
            lastName: true,
            img: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: updatedUser,
      message: 'Utilisateur mis à jour avec succès',
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la mise à jour de l'utilisateur",
    });
  }
};



export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    console.log(`🗑️ Tentative de suppression de l'utilisateur: ${id}`);

    // ✅ Vérifier si l'utilisateur existe
    const existingUser = await prisma.user.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            commandes: true,
            commandesAssignees: true,
            commandesControlees: true,
            controles: true,
          },
        },
      },
    });

    if (!existingUser) {
      console.log(`❌ Utilisateur ${id} non trouvé`);
      res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé',
      });
      return;
    }

    // ✅ Vérifier les dépendances avant suppression
    const hasDependencies = 
      existingUser._count.commandes > 0 ||
      existingUser._count.commandesAssignees > 0 ||
      existingUser._count.commandesControlees > 0 ||
      existingUser._count.controles > 0;

    if (hasDependencies) {
      console.log(`⚠️ Utilisateur ${id} a des dépendances, suppression refusée`);
      res.status(409).json({
        success: false,
        message: 'Impossible de supprimer cet utilisateur car il est associé à des commandes ou contrôles',
        details: {
          commandes: existingUser._count.commandes,
          commandesAssignees: existingUser._count.commandesAssignees,
          commandesControlees: existingUser._count.commandesControlees,
          controles: existingUser._count.controles,
        },
      });
      return;
    }

    res.json({
      success: true,
      message: 'Utilisateur supprimé avec succès',
    });

  } catch (error: any) {
    console.error('❌ Erreur suppression utilisateur:', error);

    // ✅ Gestion des erreurs spécifiques Prisma
    if (error.code === 'P2025') {
      res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé',
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de l\'utilisateur',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

export const getUser = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const user = await prisma.user.findFirst({ where : {id} });
   
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
      where.disponibilite = disponibilite === 'false' || disponibilite === 'true';
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
        email: true,
        role: true,
        disponibilite: true,
        profile: { select: { firstName: true, lastName: true, img: true } }
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