import { Router, Request, Response } from 'express';
import cartRoutes from './cart.routes';

const router = Router();

// Health check endpoint
router.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

router.use('/cart', cartRoutes);

export default router;
