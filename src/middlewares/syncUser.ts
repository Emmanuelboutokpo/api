  import { clerkClient, getAuth } from "@clerk/express";
  import prisma from "../lib/prisma";
  import { Request, Response, NextFunction } from 'express';
  
  export const syncUser = async (
      req: Request,
      res: Response,
      next: NextFunction
    ) => {
      const { userId } = getAuth(req)
      
      if (userId) {
        try {
          const clerkUser = await clerkClient.users.getUser(userId);
          const existing = await prisma.user.findUnique({ where: { clerkId: userId } });
  
          if (!existing) {
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
          
        } catch (error) {
          console.error('Erreur de synchronisation:', error);
          return next(error);
        }
      }
      next();
    };
  

