import { Router } from 'express';
const router: Router = Router();

import { signUpEmail, verifyOpt, logoutUser, refreshTokens } from '../controllers/auth.controller';
import { isRequestValidated } from '../validator/auth.validator';

router.post('/signup', signUpEmail, isRequestValidated);    
router.post('/verify-otp', verifyOpt);
router.post('/login', logoutUser, isRequestValidated);
router.post('/refresh-token', refreshTokens);
router.post('/logout/:id', logoutUser);

export default router;