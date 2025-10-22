import { Router } from 'express';

import { createOrUpdate, getMyProfile, getUsers } from '../controllers/users.controller';

import type { Router as ExpressRouter } from 'express';
import { requireAuth } from '@clerk/express';
import { syncUser } from '../middlewares/syncUser';
const router: ExpressRouter = Router();


// Routes
  router.post('/create-or-update', requireAuth(), createOrUpdate );
  router.get('/user/me', syncUser, getMyProfile);
  router.get('/users', requireAuth(), getUsers);

export default router;
