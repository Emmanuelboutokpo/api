import { Router } from "express";
import {
  createCommande,
  getCommandes,
  getCommandeById,
  updateCommande,
  deleteCommande,
  checkLivraisonReminders,
} from "../controllers/commande.controller";

const router: Router = Router();

router.post("/commandes", createCommande);
router.get("/commande", getCommandes);
router.get("/commande/:id", getCommandeById);
router.get("/check-delivery", checkLivraisonReminders);
router.put("/commande/:id", updateCommande);
router.delete("/commande/:id", deleteCommande);

export default router;
