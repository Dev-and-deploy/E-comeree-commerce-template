import { Router } from 'express';
import {
  getAllProducts,
  getProductBySlug,
  getAllProductsAdmin,
  createProduct,
  updateProduct,
  deleteProduct,
  getFeaturedProducts,
} from '../controllers/productController.js';
import { authMiddleware, adminMiddleware } from '../utils/jwt.js';

const router = Router();

// Public routes
router.get('/', getAllProducts);
router.get('/featured', getFeaturedProducts);
router.get('/:slug', getProductBySlug);

// Admin routes
router.get('/admin/all', authMiddleware, adminMiddleware, getAllProductsAdmin);
router.post('/admin', authMiddleware, adminMiddleware, createProduct);
router.put('/admin/:id', authMiddleware, adminMiddleware, updateProduct);
router.delete('/admin/:id', authMiddleware, adminMiddleware, deleteProduct);

export default router;
