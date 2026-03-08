import { Router } from 'express';
import { register, login, getCurrentUser, updateProfile } from '../controllers/authController.js';
import { authMiddleware } from '../utils/jwt.js';

const router = Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/me', authMiddleware, getCurrentUser);
router.put('/profile', authMiddleware, updateProfile);

export default router;
