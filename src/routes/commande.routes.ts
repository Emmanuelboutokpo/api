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
  getAssignedCommandes,
} from "../controllers/commande.controller";
 import upload from "../middlewares/uploadMiddleware";
import { authorize, requireSignin } from "../middlewares/requireSignin";

const router: Router = Router();

router.post("/commandes", requireSignin, upload.fields([
  { name: 'modelImages', maxCount: 10 },   
  { name: 'tissuImages', maxCount: 10 }, 
  { name: 'audioFile', maxCount: 1 }
]),authorize('ADMIN'), createCommande);

router.get("/commande",requireSignin, getCommandes);
router.get("/commande/:id",requireSignin, getCommandeById);
router.get("/assigned", requireSignin, getAssignedCommandes);

router.put("/commande/:id", upload.fields([
  { name: 'modelImages', maxCount: 10 },
  { name: 'tissuImages', maxCount: 10 },
  { name: 'audioFile', maxCount: 1 }
]),requireSignin,authorize('ADMIN'), updateCommande);

router.delete("/commande/:id",requireSignin,authorize('ADMIN'), deleteCommande);

router.patch("/commandes/:id/accept",requireSignin,authorize('EMPLOYEE'), acceptCommande);
router.patch("/commandes/:id/confirm-preparation",requireSignin, confirmPreparation);
router.patch("/commandes/:id/control",requireSignin, markAsReadyForControl);
router.patch("/commandes/:id/to-control", assignControleur);


export default router;
