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

  public getAllCoupons = asyncHandler(async (req: Request, res: Response) => {
    const coupons = await this.discountService.getAllCoupons();
    res.status(200).json({ status: 'success', data: coupons });
  });

  public createCoupon = asyncHandler(async (req: Request, res: Response) => {
    const coupon = await this.discountService.createManualCoupon(req.body);
    res.status(201).json({ status: 'success', data: coupon });
  });

  public disableCoupon = asyncHandler(async (req: Request, res: Response) => {
    const { code } = req.params;
    const coupon = await this.discountService.disableCoupon(code as string);
    res.status(200).json({ status: 'success', data: coupon });
  });

  public deleteCoupon = asyncHandler(async (req: Request, res: Response) => {
    const { code } = req.params;
    await this.discountService.deleteCoupon(code as string);
    res.status(200).json({ status: 'success', message: 'Coupon deleted' });
  });
}
