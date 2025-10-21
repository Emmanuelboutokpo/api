import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { clerkClient, getAuth } from '@clerk/express';

export const getMe = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { userId } = getAuth(req)
  const clerkId = userId;
  if (!clerkId) {
    res.status(400).json({ message: 'Invalid user ID' });
    return;
  }
  let user = await prisma.user.findUnique({ where: { clerkId } });
  const clerkUser = await clerkClient.users.getUser(userId);
   if (!user) {
               await prisma.user.upsert({
                 where: { clerkId: userId },
                 update: {
                   name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim(),
                   email: clerkUser.emailAddresses[0]?.emailAddress || '',
                 },
                 create: {
                   clerkId: userId,
                   name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim(),
                   email: clerkUser.emailAddresses[0]?.emailAddress || '',
                   role: 'EMPLOYEE',
                 },
               });
             };

    res.json(user);

  res.json(user);
     
};

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

export const updateUser = async (req: Request, res: Response): Promise<void> => {
  const { userId } = req.params;
  const { name, role, email } = req.body;
  const { userId: clerkId } = getAuth(req);
  const targetUser = await prisma.user.findUnique({ where: { id: userId } });

if (!targetUser) {
  res.status(404).json({ message: 'User not found' });
  return;
}

if (!clerkId) {
  res.status(401).json({ message: 'Unauthorized: missing clerkId' });
  return;
}

const currentUser = await prisma.user.findUnique({ where: { clerkId } });

if (!currentUser) {
  res.status(401).json({ message: 'Unauthorized' });
  return;
}

  const data: any = {};
  if (name) data.name = name;
  if (email) data.email = email;

  if (role && currentUser.role === 'ADMIN') {
    data.role = role;
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data,
  });

  res.json({ message: 'User updated', user: updatedUser });
};

