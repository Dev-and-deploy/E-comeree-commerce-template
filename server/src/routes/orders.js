import { Router } from 'express';
import { 
  createOrder, 
  getUserOrders, 
  getAllOrders, 
  getOrderById, 
  updateOrderStatus, 
  deleteOrder 
} from '../controllers/orderController.js';
import { authMiddleware, adminMiddleware } from '../utils/jwt.js';

const router = Router();

// Protected routes
router.post('/', authMiddleware, createOrder);
router.get('/my-orders', authMiddleware, getUserOrders);

// Admin routes
router.get('/admin/all', authMiddleware, adminMiddleware, getAllOrders);
router.get('/admin/:id', authMiddleware, adminMiddleware, getOrderById);
router.put('/admin/:id/status', authMiddleware, adminMiddleware, updateOrderStatus);
router.delete('/admin/:id', authMiddleware, adminMiddleware, deleteOrder);

export default router;