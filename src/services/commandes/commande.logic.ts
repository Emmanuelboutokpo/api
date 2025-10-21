import { Prisma } from "@prisma/client";
type Tx = Prisma.TransactionClient ;

export async function getOrCreateClient(
  tx: any,
  clientId?: number,
  clientPayload?: any
) {

  console.log("Quel client par ici");
  if (clientId) {
    const client = await tx.client.findUnique({ where: { id: clientId } });
    if (!client) throw new Error("Client introuvable");
    return client;
  }

  if (!clientPayload) throw new Error("Client manquant");

  return tx.client.create({
    data: {
      firstName: clientPayload.firstName,
      lastName: clientPayload.lastName,
      telephone: clientPayload.telephone,
      adresse: clientPayload.adresse || null,
      gender: clientPayload.gender || "M",
      imageUrl: clientPayload.imageUrl || null,
    },
  });
}

export async function validateEmploye(tx: any, employeId: number) {
  console.log("Quel employé par ici");
 const employe = await tx.user.findUnique({ 
  where: { 
    id: employeId,
    role: 'EMPLOYEE',
    disponibilite: true  
  } 
});

  if (!employe)  throw { status: 400, message: 'Employé non disponible ou invalide' };
  return employe;
}

export async function getOrCreateStyle(
  tx: any,
  styleId?: number,
  stylePayload?: any
) {
 
  if (styleId) {
    const style = await tx.style.findUnique({ where: { id: styleId } });
    if (!style) throw new Error("Style introuvable");
    return style;
  }

  if (!stylePayload) throw new Error("Style manquant");

  try {
    return await tx.style.create({
      data: {
        model: stylePayload.nom,
      },
    });
  } catch (error: any) {
    if (error.code === "P2002") {
      const existing = await tx.style.findUnique({ where: { model: stylePayload.nom } });
      if (!existing) throw new Error("Style déjà existant mais introuvable");
      return existing;
    }
    throw error;
  }
   console.log("Quel style par ici");
}

export async function createPaiementIfNeeded(
  tx: any,
  commande: any,
  client: any,
  montantAvance: number
) {
  if (montantAvance > 0) {
    await tx.paiement.create({
      data: {
        montant: montantAvance,
        modePaiement: "ESPECES",
        statut: "VALIDE",
        commandeId: commande.id,
        clientId: client.id,
      },
    });
  }
  console.log("Quel paiement par ici");
}

export async function createNotification(
  tx:any,
  commande: any,
  employe: any,
  style: any
) {
  await tx.notification.create({
    data: {
      commandeId: commande.id,
      message: `Nouvelle commande #${commande.id} (Style: ${style.model}) assignée.`,
      status: "ASSIGNATION",
      destinataireId: employe.id,
    },
  });

  console.log("Quel notification par ici");
}
