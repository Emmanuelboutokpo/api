// import { Router } from "express";
// import {
//   createCommande,
//   getCommandes,
//   getCommandeById,
//   updateCommande,
//   deleteCommande,
//   confirmPreparation,
//   acceptCommande,
//   markAsReadyForControl,
//   assignControleur,
//   getAssignedCommandes,
// } from "../controllers/commande.controller";
// import { requireAuth } from "@clerk/express";
// import upload from "../middlewares/uploadMiddleware";

// const router: Router = Router();

// router.post("/commandes", requireAuth(), upload.fields([
//   { name: 'modelImages', maxCount: 10 },   
//   { name: 'tissuImages', maxCount: 10 }, 
//   { name: 'audioFile', maxCount: 1 }
// ]), createCommande);

// router.get("/commande", getCommandes);
// router.get("/commande/:id", getCommandeById);
// router.get("/assigned", requireAuth(), getAssignedCommandes);

// router.put("/commande/:id", upload.fields([
//   { name: 'modelImages', maxCount: 10 },
//   { name: 'tissuImages', maxCount: 10 },
//   { name: 'audioFile', maxCount: 1 }
// ]), updateCommande);

// router.delete("/commande/:id", deleteCommande);

// router.patch("/commandes/:id/confirm-preparation",requireAuth(), confirmPreparation);
// router.patch("/commandes/:id/accept",requireAuth(), acceptCommande);
// router.patch("/commandes/:id/control",requireAuth(), markAsReadyForControl);
// router.patch("/commandes/:id/to-control", assignControleur);


// export default router;
