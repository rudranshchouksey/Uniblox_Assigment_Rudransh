import { Request, Response } from 'express';
import { CheckoutService } from '../services/CheckoutService';
import { asyncHandler } from '../utils/asyncHandler';

export class CheckoutController {
  constructor(private checkoutService: CheckoutService) {}

  public processCheckout = asyncHandler(async (req: Request, res: Response) => {
    const { customerId, discountCode } = req.body;
    const orderSummary = await this.checkoutService.checkout(customerId, discountCode);
    res.status(200).json({ status: 'success', data: orderSummary });
  });

  public validateDiscount = asyncHandler(async (req: Request, res: Response) => {
    const { code } = req.body;
    try {
      const coupon = await this.checkoutService.validateDiscount(code);
      res.status(200).json({ status: 'success', data: coupon });
    } catch (error: any) {
      if (error.name === 'NotFoundError' || error.name === 'ValidationError') {
        res.status(200).json({ status: 'error', message: error.message });
      } else {
        throw error;
      }
    }
  });
}
