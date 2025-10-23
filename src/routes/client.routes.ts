import { Router } from 'express';
import {
  getClientById,
  createClient,
  updateClient,
  deleteClient,
  getClientsGroupedByStyle,
  getClientsByStyle,
  getAllClients,
} from '../controllers/client.controller';
import upload from '../middlewares/uploadMiddleware';
import { globalClientValidators, isRequestValidated } from '../validator/clientValidators';
import { clerkMiddleware } from '@clerk/express';
import { requireAdmin } from '../middlewares/requireAdmin';
 
const router: Router = Router();

router.use(clerkMiddleware());

router.get('/grouped-by-style', getClientsGroupedByStyle);
router.get('/by-style/:model', getClientsByStyle);
router.get('/clients', getAllClients);
router.get('/client/:id', getClientById);
router.post('/clients', globalClientValidators,isRequestValidated, upload.single('imageUrl'), createClient);
router.put('/client/:id', globalClientValidators,isRequestValidated, upload.single('imageUrl'), updateClient);
router.delete('/client/:id',requireAdmin, deleteClient);

export default router;
