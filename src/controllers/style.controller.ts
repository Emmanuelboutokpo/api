import prisma from "../lib/prisma";
import { Request, Response } from "express";

// export const createStyle = async (req: Request, res: Response) => {
//   try {
//     const { clientId, model } = req.body;

//     console.log(clientId, model);
    

//     // Vérifie si le model existe déjà
//     const existing = await prisma.style.findFirst({
//       where: { model: model },
//     });

//     if (existing) {
//       return res.status(400).json({ message: "Ce model existe déjà." });
//     }

//     // Crée le model et ses dimensions associées
//     const style = await prisma.style.create({
//       data: { clientId: Number(clientId), model }
//     });

//     res.status(201).json(style);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Erreur serveur." });
//   }
// };

export const createStyleForClient = async (req: Request, res: Response) => {
  const { clientId, model } = req.body;

  if (!clientId || !model) {
    return res.status(400).json({ message: "clientId et model sont requis" });
  }

  try {
    // ✅ On connecte ou crée le style
    const style = await prisma.style.upsert({
      where: { model },
      update: {},
      create : {model}
    });

    // ✅ On connecte le style au client (dans la table pivot)
    const updatedClient = await prisma.client.update({
      where: { id: clientId },
      data: {
        styles: {
          connect: { id: style.id },
        },
      },
      include: { styles: true },
    });

    res.json({
      message: "Style ajouté avec succès au client",
      client: updatedClient,
    });
  } catch (error) {
    console.error("Erreur lors de la création du style :", error);
    res.status(500).json({ message: "Erreur serveur", error });
  }
};


export const getStyle = async (req: Request, res: Response) => {
  try {
    const style = await prisma.style.findMany();
    res.status(200).json(style);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur." });
  }
};

export const updateStyle = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { clientId, model } = req.body;

    const sizeId = Number(id);

    const updated = await prisma.style.update({
      where: { id: sizeId },
      data: { clientId: Number(clientId), model }
    });

    res.status(200).json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur", error });
  }
};

export const deleteStyle = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.style.delete({
      where: { id: Number(id) },
    });

    res.status(200).json({ message: "Model supprimé avec succès." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur." });
  }
};