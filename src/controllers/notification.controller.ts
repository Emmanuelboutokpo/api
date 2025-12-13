// import { Request, Response } from "express";
// import { getAuth } from "@clerk/express";
// import prisma from "../lib/prisma";

// export const getNotifications = async (req: Request, res: Response) => {
//   try {
//     const { userId } = getAuth(req as any);

//     if (!userId) {
//       return res.status(401).json({ error: "Not authenticated" });
//     }

//     const user = await prisma.user.findUnique({
//       where: { clerkId: userId },
//     });

//     if (!user) {
//       return res.status(404).json({ error: "Utilisateur non trouvé" });
//     }

//     const notifications = await prisma.notification.findMany({
//       where: { status: "EN_ATTENTE" },
//       include: {
//         commande: {
//           include: {
//             client: true,
//             style: true,
//           },
//         },
//       },
//       orderBy: { createdAt: "desc" },
//     });

//     return res.status(200).json(notifications);
//   } catch (error: any) {
//     console.error("Erreur lors de la récupération des notifications:", error);
//     return res.status(500).json({ error: "Erreur interne du serveur" });
//   }
// };
