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

router.post('/label-mesures', addMesureType, requireSignin);  
router.get('/label-mesures', getMesureType, requireSignin);  
router.get('/label-mesure/:id', getMesureTypeById, requireSignin);  
router.patch('/label-mesure/:id', updateMesureType, requireSignin);  
router.delete('/label-mesure/:id', deleteMesureType, requireSignin);  

export default router;
