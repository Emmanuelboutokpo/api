import { Request, Response } from 'express';
import prisma from '../lib/prisma';


export const getUsers = async (req: Request, res: Response): Promise<void> => {
  const { skip = '0', take = '10' } = req.query;

  const skipNumber = parseInt(skip as string, 10);
  const takeNumber = parseInt(take as string, 10);

  const users = await prisma.user.findMany({
    skip: skipNumber,
    take: takeNumber,
    orderBy: {
      createdAt: 'desc',
    },
  });

  const totalCount = await prisma.user.count();

  res.json({
    data: users,
    meta: {
      total: totalCount,
      skip: skipNumber,
      take: takeNumber,
    },
  });
};

export const createOrUpdate = async (req: Request, res: Response): Promise<void> => {
  const { clerkId, email, firstName, lastName } = req.body;

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
        },
        create: {
          clerkId,
          email,
          firstName,
          lastName,
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

