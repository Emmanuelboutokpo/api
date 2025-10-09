import { Router } from 'express';
import {
  addMesureToTableau,
  updateMesureTableau,
  deleteMesureTableau,
  getMesureTableau,
  getMesureTableauById,
} from '../controllers/tableauDeMesure.controller';

const router = Router();

router.post('/tableau-mesures', addMesureToTableau);  
router.get('/tableau-mesures', getMesureTableau);  
router.get('/tableau-mesure/:id', getMesureTableauById);  
router.patch('/tableau-mesure/:id', updateMesureTableau);  
router.delete('/tableau-mesure/:id', deleteMesureTableau);  

export default router;
