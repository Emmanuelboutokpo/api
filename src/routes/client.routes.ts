import { Router } from 'express';
import {
  getClientById,
  updateClient,
  deleteClient,
  getAllClients,
} from '../controllers/client.controller';
 import { globalClientValidators, isRequestValidated } from '../validator/clientValidators';
  
const router: Router = Router();

 
router.get('/clients', getAllClients);
router.get('/client/:id', getClientById);
router.put('/client/:id', globalClientValidators,isRequestValidated, updateClient);
router.delete('/client/:id', deleteClient);

export default router;
