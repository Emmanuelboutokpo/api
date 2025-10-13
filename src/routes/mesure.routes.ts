import { Router } from 'express';
import { createMesure, deleteMesure, getMesuresByClient, updateMesure} from '../controllers/mesure.controller';
 
const router = Router();

router.post("/mesures", createMesure);
router.get('/mesure/:clientId', getMesuresByClient);
router.patch('/mesure/:id', updateMesure);
 router.delete("/mesure/:id", deleteMesure);

export default router;
