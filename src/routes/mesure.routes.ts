import { Router } from 'express';
import { createMesure, deleteMesureManuel, getMesures, getMesuresByClient, getMesuresById } from '../controllers/mesure.controller';
import { globalMesureValidator, isRequestValidated } from '../validator/mesure.validator';

 
const router = Router();

router.get('/client-mesure/:clientId', getMesuresByClient);
router.get('/mesures', getMesures);
router.post('/mesures', globalMesureValidator,isRequestValidated, createMesure);
router.get('/mesure/:id', getMesuresById);
router.delete('/mesure/:id', deleteMesureManuel);

export default router;
