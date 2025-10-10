import { Router } from 'express';
import { getMesuresByClient} from '../controllers/mesure.controller';
 
const router = Router();

router.get('/client-mesure/:clientId', getMesuresByClient);

export default router;
