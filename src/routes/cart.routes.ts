import { Router } from 'express';
import { CartController } from '../controllers/CartController';
import { CartService } from '../services/CartService';
import { cartRepository, productRepository } from '../store';
import { validate } from '../middleware/validate';
import {
  addToCartSchema,
  updateCartItemSchema,
  removeCartItemSchema,
  getCartSchema,
} from '../validators/cart.validator';

const router = Router();

// Dependency Injection
const cartService = new CartService(cartRepository, productRepository);
const cartController = new CartController(cartService);

router.get('/:customerId', validate(getCartSchema), cartController.getCart);
router.post('/items', validate(addToCartSchema), cartController.addItem);
router.patch('/items/:productId', validate(updateCartItemSchema), cartController.updateItem);
router.delete('/items/:productId', validate(removeCartItemSchema), cartController.removeItem);

export default router;
