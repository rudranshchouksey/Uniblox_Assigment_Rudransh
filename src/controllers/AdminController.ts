import { Request, Response, NextFunction } from 'express';
import { DiscountService } from '../services/DiscountService';
import { AnalyticsService } from '../services/AnalyticsService';

export class AdminController {
  constructor(
    private discountService: DiscountService,
    private analyticsService: AnalyticsService
  ) {}

  public generateDiscount = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const coupon = await this.discountService.generateAdminCoupon();
      
      if (!coupon) {
        return res.status(400).json({ 
          status: 'error', 
          message: 'Current total orders do not satisfy the Nth order rule for coupon generation' 
        });
      }

      res.status(201).json({ status: 'success', data: coupon });
    } catch (error) {
      next(error);
    }
  };

  public getStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const stats = await this.analyticsService.getStats();
      res.status(200).json({ status: 'success', data: stats });
    } catch (error) {
      next(error);
    }
  };
}
