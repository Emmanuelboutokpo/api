import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import jwt from 'jsonwebtoken';

export const requireController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET!);
      const user = await prisma.user.findUnique({where : {id: (payload as any).id}});
      
       if (!user || user.role !== 'CONTROLLEUR') {
         res.status(403).json({ message: 'Forbidden: controller only' });
         return;
       }
 
      next();
    } catch (error) {
      res.status(401).json({ error: 'Invalid token' });
    }
 
};


export const requireAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET!);
      const user = await prisma.user.findUnique({where : {id: (payload as any).id}});
      
       if (!user || user.role !== 'ADMIN') {
         res.status(403).json({ message: 'Forbidden: controller only' });
         return;
       }
 
      next();
    } catch (error) {
      res.status(401).json({ error: 'Invalid token' });
    }
 
};


export const requireEmployee = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET!);
      const user = await prisma.user.findUnique({where : {id: (payload as any).id}});
      
       if (!user || user.role !== 'EMPLOYEE') {
         res.status(403).json({ message: 'Forbidden: controller only' });
         return;
       }
 
      next();
    } catch (error) {
      res.status(401).json({ error: 'Invalid token' });
    }
 
};