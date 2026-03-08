import { Router } from 'express';
import {
  getProfile,
  updateProfile,
  getAllProfiles,
  getProfileById,
  updateProfileById,
  deleteProfile,
} from '../controllers/profileController.js';
import { authMiddleware, adminMiddleware } from '../utils/jwt.js';

const router = Router();

// User routes
router.get('/me', authMiddleware, getProfile);
router.put('/me', authMiddleware, updateProfile);

// Admin routes
router.get('/admin/all', authMiddleware, adminMiddleware, getAllProfiles);
router.get('/admin/:id', authMiddleware, adminMiddleware, getProfileById);
router.put('/admin/:id', authMiddleware, adminMiddleware, updateProfileById);
router.delete('/admin/:id', authMiddleware, adminMiddleware, deleteProfile);

export default router;
