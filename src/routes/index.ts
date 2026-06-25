import { Router, Request, Response } from 'express';
import cartRoutes from './cart.routes';
import checkoutRoutes from './checkout.routes';

const router = Router();

// Health check endpoint
router.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

router.use('/cart', cartRoutes);
router.use('/checkout', checkoutRoutes);

export default router;
