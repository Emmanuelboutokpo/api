import { Router } from 'express';

import { createOrUpdate, deleteUser, getEmployeesAndControleurs, getUser, getUsers, updateUser } from '../controllers/users.controller';

import type { Router as ExpressRouter } from 'express';
import { requireAuth } from '@clerk/express';
const router: ExpressRouter = Router();


// Routes
  router.post('/create-or-update', createOrUpdate );
  router.get('/user/me/:clerkId', getUser);
  router.get('/users/team', getEmployeesAndControleurs);
  router.get('/users', requireAuth(), getUsers);
  router.put('/users/:id', updateUser);
  router.delete('/users/:id', deleteUser);
export default router;
