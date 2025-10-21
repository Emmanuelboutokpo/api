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
  type? : "EN_ATTENTE" | "ASSIGNATION" | "RAPPEL_LIVRAISON" | 'PENALITE' | "VALIDATION" | "ASSIGNATION" | "LIVRAISON_PRET" | 'RETARD' | "CONTROLE"
  commandeId: string;
  message: string;
  destinataireId: string;
}) {
  // Save notification in DB
  const notif = await prisma.notification.create({
    data: { commandeId, message, destinataireId, status : type },
  });

  // Emit socket
  try {
    const io = getIO();
    io.to(destinataireId).emit("notification:new", notif);
  } catch (err) {
    console.warn("Socket emit failed:", (err as Error).message);
  }

  // Push via Expo if push token found
  const user = await prisma.user.findUnique({ where: { id: destinataireId }, select: { expoPushToken: true } });
  if (user?.expoPushToken && Expo.isExpoPushToken(user.expoPushToken)) {
    const messages = [
      {
        to: user.expoPushToken,
        sound: "default",
        title: "Atelier - Nouvelle notification",
        body: message,
        data: { commandeId },
      },
    ];
    const chunks = expo.chunkPushNotifications(messages);
    for (const chunk of chunks) {
      try {
        await expo.sendPushNotificationsAsync(chunk);
      } catch (e) {
        console.error("Expo push failed:", e);
      }
    }
  }

  return notif;
}
