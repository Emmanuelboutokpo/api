// import Expo from "expo-server-sdk";
// import prisma from "../../lib/prisma";
// import { getIO } from "../../lib/socket";


// const expo = new Expo();

// export async function createAndSendNotification({
//   type,
//   commandeId,
//   message,
//   destinataireId,
// }: {
//   type? : "EN_ATTENTE" | "ASSIGNATION" | "RAPPEL_LIVRAISON" | 'PENALITE' | "VALIDATION" | "ASSIGNATION" | "LIVRAISON_PRET" | 'RETARD' | "CONTROLE"
//   commandeId: string;
//   message: string;
//   destinataireId: string;
// }) {
//   // Save notification in DB
//   const notif = await prisma.notification.create({
//     data: { commandeId, message, destinataireId, status : type },
//   });

//   // Emit socket
//   try {
//     const io = getIO();
//     io.to(destinataireId).emit("notification:new", notif);
//   } catch (err) {
//     console.warn("Socket emit failed:", (err as Error).message);
//   }

//   // Push via Expo if push token found
//   const user = await prisma.user.findUnique({ where: { id: destinataireId }, select: { expoPushToken: true } });
//   if (user?.expoPushToken && Expo.isExpoPushToken(user.expoPushToken)) {
//     const messages = [
//       {
//         to: user.expoPushToken,
//         sound: "default",
//         title: "Atelier - Nouvelle notification",
//         body: message,
//         data: { commandeId },
//       },
//     ];
//     const chunks = expo.chunkPushNotifications(messages);
//     for (const chunk of chunks) {
//       try {
//         await expo.sendPushNotificationsAsync(chunk);
//       } catch (e) {
//         console.error("Expo push failed:", e);
//       }
//     }
//   }

//   return notif;
// }


// services/notification/service.ts
import Expo from "expo-server-sdk";
import prisma from "../../lib/prisma";
import { getIO } from "../../lib/socket";

const expo = new Expo();

export async function createAndSendNotification({
  type,
  commandeId,
  message,
  destinataireId,
}: {
  type?: "EN_ATTENTE" | "ASSIGNATION" | "RAPPEL_LIVRAISON" | 'PENALITE' | "VALIDATION" | "LIVRAISON_PRET" | 'RETARD' | "CONTROLE"
  commandeId: string;
  message: string;
  destinataireId: string;
}) {
  try {
    console.log(`📨 Tentative d'envoi notification pour commande: ${commandeId}, destinataire: ${destinataireId}`);

    // NE PAS créer une nouvelle notification en base ici
    // La notification est déjà créée dans la transaction
    
    // Vérifier que le destinataire existe et a un token
    const destinataire = await prisma.user.findUnique({
      where: { id: destinataireId },
      select: { expoPushToken: true }
    });

    if (!destinataire) {
      console.error(`❌ Destinataire ${destinataireId} non trouvé`);
      return null;
    }

    // Emit socket seulement
    try {
      const io = getIO();
      const socketData = {
        id: `temp-${Date.now()}`, // ID temporaire pour le socket
        commandeId,
        message,
        destinataireId,
        status: type,
        createdAt: new Date()
      };
      
      io.to(destinataireId).emit("notification:new", socketData);
      console.log(`📡 Socket émis à ${destinataireId}`);
    } catch (err) {
      console.warn("❌ Socket emit failed:", (err as Error).message);
    }

    // Push via Expo si le token existe
    if (destinataire.expoPushToken && Expo.isExpoPushToken(destinataire.expoPushToken)) {
      const messages = [
        {
          to: destinataire.expoPushToken,
          sound: "default",
          title: "Atelier - Nouvelle notification",
          body: message,
          data: { 
            commandeId,
            type: type
          },
        },
      ];
      
      const chunks = expo.chunkPushNotifications(messages);
      for (const chunk of chunks) {
        try {
          const tickets = await expo.sendPushNotificationsAsync(chunk);
          console.log(`📱 Push notification envoyée:`, tickets);
        } catch (e) {
          console.error("❌ Expo push failed:", e);
        }
      }
    } else {
      console.log(`ℹ️  Pas de token Expo valide pour ${destinataireId}`);
    }

    return { success: true, message: "Notification envoyée" };

  } catch (error: any) {
    console.error("❌ Erreur envoi notification:", error);
    return null;
  }
}