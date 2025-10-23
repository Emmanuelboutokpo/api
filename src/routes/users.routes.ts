import { Router } from 'express';

import { createOrUpdate, getMyProfile, getUsers } from '../controllers/users.controller';

import type { Router as ExpressRouter } from 'express';
import { requireAuth } from '@clerk/express';
import { syncUser } from '../middlewares/syncUser';
const router: ExpressRouter = Router();


// Routes
  router.post('/create-or-update', createOrUpdate );
  router.get('/user/me', getMyProfile);
  router.get('/users', requireAuth(), getUsers);

export default router;
