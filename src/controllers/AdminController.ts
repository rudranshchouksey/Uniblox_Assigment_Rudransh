import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { DiscountService } from '../services/DiscountService';
import { AnalyticsService } from '../services/AnalyticsService';

export class AdminController {
  constructor(
    private discountService: DiscountService,
    private analyticsService: AnalyticsService
  ) {}

  public generateDiscount = asyncHandler(async (req: Request, res: Response) => {
    const coupon = await this.discountService.generateAdminCoupon();
    
    if (!coupon) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'Current total orders do not satisfy the Nth order rule for coupon generation' 
      });
    }

    res.status(201).json({ status: 'success', data: coupon });
  });

  public getStats = asyncHandler(async (req: Request, res: Response) => {
    const stats = await this.analyticsService.getStats();
    res.status(200).json({ status: 'success', data: stats });
  });
}
