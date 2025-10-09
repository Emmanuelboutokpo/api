import { Router } from 'express';
import { requireAdmin } from '../middlewares/requireAdmin';
import { clerkMiddleware, requireAuth } from '@clerk/express';
import { getMe, getUsers, updateUser } from '../controllers/users.controller';

import type { Router as ExpressRouter } from 'express';
const router: ExpressRouter = Router();

router.use(clerkMiddleware());

// Routes
  router.get('/me',requireAuth(), getMe );
  router.get('/users',requireAuth(), requireAdmin, getUsers);
  router.patch('/users/:userId', requireAuth(), updateUser);  

export default router;
