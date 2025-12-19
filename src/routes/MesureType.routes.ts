import { Router } from 'express';
import {
  addMesureType,
  updateMesureType,
  deleteMesureType,
  getMesureType,
  getMesureTypeById,
} from '../controllers/mesureType.controller';
import { requireSignin } from '../middlewares/requireSignin';

const router = Router();

router.post('/label-mesures', addMesureType);  
router.get('/label-mesures', getMesureType);  
router.get('/label-mesure/:id', getMesureTypeById);  
router.patch('/label-mesure/:id', updateMesureType);  
router.delete('/label-mesure/:id', deleteMesureType);  
 
export default router;
