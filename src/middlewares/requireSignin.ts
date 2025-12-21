import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';
import { log } from 'console';

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
      const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!);
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

 export const authorize = (...roles: string[]) => {
   
   return (req: Request, res: Response, next: NextFunction) => {

    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};