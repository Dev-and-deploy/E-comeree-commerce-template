import { Router } from 'express';
import {
  getAllCategories,
  getAllCategoriesAdmin,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController.js';
import { authMiddleware, adminMiddleware } from '../utils/jwt.js';

const router = Router();

// Public routes
router.get('/', getAllCategories);
router.get('/:slug', getCategoryBySlug);

// Admin routes
router.get('/admin/all', authMiddleware, adminMiddleware, getAllCategoriesAdmin);
router.post('/admin', authMiddleware, adminMiddleware, createCategory);
router.put('/admin/:id', authMiddleware, adminMiddleware, updateCategory);
router.delete('/admin/:id', authMiddleware, adminMiddleware, deleteCategory);

export default router;
