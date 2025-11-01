import { Router } from "express";
import { requireAuth } from "@clerk/express";
import { effectuerControle } from "../controllers/controle.controller";
 
const router: Router = Router();

router.patch("/commandes/:id/confirm-preparation",requireAuth(), effectuerControle);


export default router;
