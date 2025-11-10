import { Router } from 'express';
import { createMesureByOrder, deleteMesureByOrder, getMesuresByOrder, updateMesureByOrder} from '../controllers/mesure.controller';
import { requireAuth } from '@clerk/express';
 
const router = Router();

router.post("/:commandeId/mesures", createMesureByOrder);
router.get("/:commandeId/mesures", getMesuresByOrder);
router.patch("/mesures/:id", updateMesureByOrder);
router.delete("/mesures/:id", deleteMesureByOrder);


export default router;
