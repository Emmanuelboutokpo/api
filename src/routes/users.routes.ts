import { Router } from 'express';

import { getMe, getUser, getUsers, updateUser } from '../controllers/users.controller';

import type { Router as ExpressRouter } from 'express';
import { requireAuth } from '@clerk/express';
const router: ExpressRouter = Router();


// Routes
  router.get('/me', requireAuth(), getMe );
  router.get('/user/me', requireAuth(), getUser );
  router.get('/users', requireAuth(), getUsers);
  router.patch('/users/:userId', requireAuth(), updateUser);  

export default router;
