import { Router } from 'express';
import {
  getClientById,
  updateClient,
  deleteClient,
  getAllClients,
} from '../controllers/client.controller';
 import { globalClientValidators, isRequestValidated } from '../validator/clientValidators';
import { requireSignin } from '../middlewares/requireSignin';
  
const router: Router = Router();

 
router.get('/clients', getAllClients, requireSignin);
router.get('/client/:id', getClientById, requireSignin);
router.put('/client/:id', globalClientValidators,isRequestValidated, updateClient, requireSignin);
router.delete('/client/:id', deleteClient, requireSignin);

export default router;
