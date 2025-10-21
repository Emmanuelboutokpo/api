import { Router } from "express";

import { requireAuth } from "@clerk/express";
import { createFourniture, deleteFourniture, getFournitures, updateFourniture } from "../controllers/fourniture.controller";

const router: Router = Router();

router.post("/:commandeId/fournitures", requireAuth(), createFourniture);
router.get("/:commandeId/fournitures", getFournitures);
router.patch("/fournitures/:id", updateFourniture);
router.delete("/fournitures/:id", deleteFourniture);


export default router;
