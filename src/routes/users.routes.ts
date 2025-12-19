import { Router } from 'express';

import { deleteUser, getEmployeesAndControleurs, getUser, getUsers, updateUser } from '../controllers/users.controller';

import type { Router as ExpressRouter } from 'express';
const router: ExpressRouter = Router();


// Routes
  router.get('/user/me/:id', getUser);
  router.get('/users/team', getEmployeesAndControleurs);
  router.get('/users', getUsers);
  router.put('/users/:id', updateUser);
  router.delete('/users/:id', deleteUser);

export default router;
