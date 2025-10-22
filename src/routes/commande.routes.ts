import { Router } from "express";
import {
  createCommande,
  getCommandes,
  getCommandeById,
  updateCommande,
  deleteCommande,
  confirmPreparation,
  acceptCommande,
  markAsReadyForControl,
  assignControleur,
} from "../controllers/commande.controller";
import { requireAuth } from "@clerk/express";
import { syncUser } from "../middlewares/syncUser";

const router: Router = Router();

router.post("/commandes",syncUser, requireAuth(), createCommande);
router.get("/commande",syncUser, getCommandes);
router.get("/commande/:id", getCommandeById);
router.put("/commande/:id", updateCommande);
router.delete("/commande/:id", deleteCommande);

router.patch("/commandes/:id/confirm-preparation", confirmPreparation);
router.patch("/commandes/:id/accept", acceptCommande);

router.patch("/commandes/:id/control", markAsReadyForControl);
router.patch("/commandes/:id/to-control", assignControleur);


export default router;
