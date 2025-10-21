import { Router } from 'express';
import {
  addMesureType,
  updateMesureType,
  deleteMesureType,
  getMesureType,
  getMesureTypeById,
} from '../controllers/mesureType.controller';

const router = Router();

router.patch('/label-mesure/:id', updateMesureType);  
router.delete('/label-mesure/:id', deleteMesureType);  

export default router;
