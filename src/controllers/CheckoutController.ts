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
    const coupon = await this.checkoutService.validateDiscount(code);
    res.status(200).json({ status: 'success', data: coupon });
  });
}
