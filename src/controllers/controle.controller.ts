// import { getAuth } from "@clerk/express";
// import { Request, Response } from "express";
// import prisma from "../lib/prisma";
// import { createAndSendNotification } from "../services/notification/service";
// import { generateRemuneration } from "../services/renumeration/remuneration.service";
 
// export const effectuerControle = async (req: Request, res: Response) => {
//   const { id } = req.params;
//   const { conforme, remarques } = req.body;

//   const { userId } = getAuth(req as any);

//   if (!userId) return res.status(401).json({ error: "Not authenticated" });

//   const user = await prisma.user.findUnique({ where: { clerkId: userId } });
//   if (!user) return res.status(403).json({ error: "User not found in DB" });

//   try {
//     // ✅ On gère tout dans une transaction pour cohérence des données
//     const result = await prisma.$transaction(async (tx) => {
//       const commande = await tx.commande.findUnique({ where: { id } });
//       if (!commande) throw new Error("Commande introuvable");

//       // 🔹 Création du contrôle
//       const controle = await tx.controle.create({
//         data: {
//           commandeId: commande.id,
//           controleurId: user.id,
//           conforme,
//           remarques,
//         },
//       });

//       // 🔹 Recherche de l’admin
//       const admin = await tx.user.findFirst({
//         where: { role: "ADMIN" },
//       });
//       if (!admin) throw new Error("Aucun administrateur trouvé");

//       if (conforme) {
//         // ✅ Si la commande est conforme : mise à jour + notification + rémunération
//         await tx.commande.update({
//           where: { id },
//           data: { status: "PRET" },
//         });

//         const notif = await tx.notification.create({
//           data: {
//             commandeId: commande.id,
//             message: `La commande ${id} a été validée et est prête à être livrée.`,
//             status: "LIVRAISON_PRET",
//             destinataireId: admin.id,
//           },
//         });

//         // 🔔 Envoi de la notification
//         await createAndSendNotification({
//           commandeId: commande.id,
//           destinataireId: commande.assignedToId!,
//           message: notif.message,
//         });

//         // 💰 Génération automatique de la rémunération
//         await generateRemuneration(commande.id);
//       } else {
//         // ❌ Si la commande n’est pas conforme
//         await tx.commande.update({
//           where: { id },
//           data: { status: "NON_CONFORME", updatedAt: new Date() },
//         });

//         const notif = await tx.notification.create({
//           data: {
//             commandeId: commande.id,
//             message: `Commande ${commande.id} non conforme, veuillez retoucher sous 24h.`,
//             status: "NON_CONFORME",
//             destinataireId: admin.id,
//           },
//         });

//         await createAndSendNotification({
//           commandeId: commande.id,
//           destinataireId: commande.assignedToId!,
//           message: notif.message,
//         });
//       }

//       return controle;
//     });

//     res.json(result);
//   } catch (error) {
//     console.error("❌ Erreur effectuerControle:", error);
//     res.status(500).json({
//       message: "Erreur lors de l'exécution du contrôle",
//       error: error instanceof Error ? error.message : error,
//     });
//   }
// };
