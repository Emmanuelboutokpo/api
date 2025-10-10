import { Router } from 'express';
import {
  addMesureType,
  updateMesureType,
  deleteMesureType,
  getMesureType,
  getMesureTypeById,
} from '../controllers/mesureType.controller';

const router = Router();

router.post('/tableau-mesures', addMesureType);  
router.get('/tableau-mesures', getMesureType);  
router.get('/tableau-mesure/:id', getMesureTypeById);  
router.patch('/tableau-mesure/:id', updateMesureType);  
router.delete('/tableau-mesure/:id', deleteMesureType);  

export default router;
