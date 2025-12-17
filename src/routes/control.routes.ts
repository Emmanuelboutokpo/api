import { Router } from "express";
import { effectuerControle } from "../controllers/controle.controller";
 
const router: Router = Router();

router.patch("/commandes/:id/confirm-controle", effectuerControle);


export default router;
