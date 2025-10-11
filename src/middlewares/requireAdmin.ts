import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { getAuth } from '@clerk/express';
 
export const requireAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
   const { userId } = getAuth(req)
   if (!userId) {
    res.status(401).json({ message: 'Authentification requise' });
    return;
  }
  const user = await prisma.user.findUnique({ where: { clerkId: userId } });

  if (!user || user.role !== 'ADMIN') {
    res.status(403).json({ message: 'Forbidden: Admins only' });
    return;
  }

  next();
};
