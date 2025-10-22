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
import { clerkMiddleware, requireAuth } from '@clerk/express';
import { requireAdmin } from '../middlewares/requireAdmin';
import { syncUser } from '../middlewares/syncUser';
 
const router: Router = Router();

router.use(clerkMiddleware());

router.get('/grouped-by-style',syncUser, getClientsGroupedByStyle);
router.get('/by-style/:model', getClientsByStyle);
router.get('/clients', getAllClients);
router.get('/client/:id', getClientById);
router.post('/clients', syncUser, globalClientValidators,isRequestValidated, upload.single('imageUrl'), createClient);
router.put('/client/:id', syncUser, globalClientValidators,isRequestValidated, upload.single('imageUrl'), updateClient);
router.delete('/client/:id',requireAdmin, deleteClient);

export default router;
