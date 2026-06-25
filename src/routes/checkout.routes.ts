import { Router } from 'express';
import { CheckoutController } from '../controllers/CheckoutController';
import { CheckoutService } from '../services/CheckoutService';
import { DiscountService } from '../services/DiscountService';
import { cartRepository, productRepository, orderRepository, discountRepository } from '../store';
import { validate } from '../middleware/validate';
import { checkoutSchema } from '../validators/checkout.validator';

const router = Router();

// Dependency Injection
const discountService = new DiscountService(discountRepository, orderRepository);
const checkoutService = new CheckoutService(cartRepository, productRepository, orderRepository, discountService);
const checkoutController = new CheckoutController(checkoutService);

router.post('/', validate(checkoutSchema), checkoutController.processCheckout);
router.post('/validate-discount', checkoutController.validateDiscount);

export default router;
