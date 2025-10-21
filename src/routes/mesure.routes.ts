import { Router } from 'express';
import { createMesureByOrder, deleteMesureByOrder, getMesuresByOrder, updateMesureByOrder} from '../controllers/mesure.controller';
import { requireAuth } from '@clerk/express';
 
const router = Router();

router.post("/:commandeId/mesures", requireAuth, createMesureByOrder);
router.get("/:commandeId/mesures", requireAuth, getMesuresByOrder);
router.patch("/mesures/:id", requireAuth, updateMesureByOrder);
router.delete("/mesures/:id", requireAuth, deleteMesureByOrder);


export default router;
