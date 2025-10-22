import { clerkClient, getAuth } from "@clerk/express";
import prisma from "../lib/prisma";
import { Request, Response, NextFunction } from "express";

export const syncUser = async (req: Request, res: Response, next: NextFunction) => {
  const { userId } = getAuth(req);
  console.log("🔑 userId:", userId);

  if (!userId) return next();

  try {
    const clerkUser = await clerkClient.users.getUser(userId);
    const email = clerkUser.emailAddresses[0]?.emailAddress || "";

    // ✅ Vérifier si le user existe déjà par clerkId OU email
    let existing = await prisma.user.findFirst({
      where: {
        OR: [
          { clerkId: userId },
          { email },
        ],
      },
    });

    console.log("🧩 clerkUser:", clerkUser.firstName);
    console.log("📌 existing:", existing?.email || "aucun");

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

    console.log(`✅ Synchronisation réussie: ${existing?.name} (${existing?.role})`);

    // Attacher l'utilisateur à la requête
    (req as any).user = existing;

    next();
  } catch (error: any) {
    console.error("❌ Erreur de synchronisation:", error.message);
    return next(error);
  }
};
