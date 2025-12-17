import { Router } from "express";
import { createFourniture, deleteFourniture, getFournitures, updateFourniture } from "../controllers/fourniture.controller";
import { requireSignin } from "../middlewares/requireSignin";

const router: Router = Router();

router.post("/:commandeId/fournitures", createFourniture, requireSignin);
router.get("/:commandeId/fournitures", getFournitures, requireSignin);
router.patch("/fournitures/:id", updateFourniture, requireSignin);
router.delete("/fournitures/:id", deleteFourniture, requireSignin);


export default router;
