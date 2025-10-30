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
    const destinataire = await prisma.user.findUnique({
      where: { id: destinataireId }
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

    return { success: true, message: "Notification envoyée" };

  } catch (error: any) {
    console.error("❌ Erreur envoi notification:", error);
    return null;
  }
}