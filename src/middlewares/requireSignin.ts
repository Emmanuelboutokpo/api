import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}
  
export const requireSignin  = async (
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
      
      if (!user) {
        res.status(403).json({ error: 'Authorization required' });
        return;
      }
      
      req.user = user;

      next();
    } catch (error) {
      res.status(401).json({ error: 'Invalid token' });
    }
};

 