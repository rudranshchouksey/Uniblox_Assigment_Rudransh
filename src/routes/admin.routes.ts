import { Router } from 'express';
import { AdminController } from '../controllers/AdminController';
import { DiscountService } from '../services/DiscountService';
import { AnalyticsService } from '../services/AnalyticsService';
import { orderRepository, discountRepository } from '../store';

const router = Router();

// Dependency Injection
const discountService = new DiscountService(discountRepository, orderRepository);
const analyticsService = new AnalyticsService(orderRepository, discountRepository);
const adminController = new AdminController(discountService, analyticsService);

router.post('/discounts/generate', adminController.generateDiscount);
router.get('/stats', adminController.getStats);

export default router;
