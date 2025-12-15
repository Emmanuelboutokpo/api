import { Router } from 'express';
const router: Router = Router();

import { signUpEmail, verifyOtp, logoutUser, refreshTokens, login } from '../controllers/auth.controller';
import { isRequestValidated } from '../validator/auth.validator';

router.post('/signup', signUpEmail, isRequestValidated);    
router.post('/verify-otp', verifyOtp);
router.post('/resend-otp', verifyOtp);
router.post('/login', login, isRequestValidated);
router.post('/refresh-token', refreshTokens);
router.post('/logout/:id', logoutUser);

export default router;