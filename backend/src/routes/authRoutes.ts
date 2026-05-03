import { Router } from 'express';
import { register, login, changePassword, requestPasswordReset, resetPassword, logout, forgotPassword, verifyOtpHandler } from '../controllers/authController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/change-password', authenticate, changePassword);
router.post('/request-password-reset', requestPasswordReset);
router.post('/reset-password', resetPassword);
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOtpHandler);
router.post('/logout', authenticate, logout);

export default router;
