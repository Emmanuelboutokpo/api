import { Router } from 'express';

import { createOrUpdate, getUser, getUsers } from '../controllers/users.controller';

import type { Router as ExpressRouter } from 'express';
import { requireAuth } from '@clerk/express';
const router: ExpressRouter = Router();


// Routes
  router.post('/create-or-update', createOrUpdate );
  router.get('/user/me', getUser);
  router.get('/users', requireAuth(), getUsers);

export default router;
