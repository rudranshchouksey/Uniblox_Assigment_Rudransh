import { Request, Response, NextFunction } from 'express';
import { CheckoutService } from '../services/CheckoutService';

export class CheckoutController {
  constructor(private checkoutService: CheckoutService) {}

  public processCheckout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { customerId, discountCode } = req.body;
      const orderSummary = await this.checkoutService.checkout(customerId, discountCode);
      res.status(200).json({ status: 'success', data: orderSummary });
    } catch (error) {
      next(error);
    }
  };
}
