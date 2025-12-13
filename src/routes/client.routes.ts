// import { Router } from 'express';
// import {
//   getClientById,
//   updateClient,
//   deleteClient,
//   getAllClients,
// } from '../controllers/client.controller';
// import upload from '../middlewares/uploadMiddleware';
// import { globalClientValidators, isRequestValidated } from '../validator/clientValidators';
// import { clerkMiddleware } from '@clerk/express';
// import { requireAdmin } from '../middlewares/requireSignin';
 
// const router: Router = Router();

// router.use(clerkMiddleware());

// router.get('/clients', getAllClients);
// router.get('/client/:id', getClientById);
// router.put('/client/:id', globalClientValidators,isRequestValidated, updateClient);
// router.delete('/client/:id', deleteClient);

// export default router;
