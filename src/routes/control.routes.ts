import { Router } from "express";
import { requireAuth } from "@clerk/express";
import { effectuerControle } from "../controllers/controle.controller";
 
const router: Router = Router();

router.patch("/commandes/:id/confirm-controle",requireAuth(), effectuerControle);


export default router;
