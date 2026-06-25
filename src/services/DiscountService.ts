import { DiscountCode } from '../models';
import { IDiscountRepository } from '../repositories/DiscountRepository';
import { IOrderRepository } from '../repositories/OrderRepository';
import { ValidationError, NotFoundError } from '../errors/AppError';
import { v4 as uuidv4 } from 'uuid';
import { env } from '../config/env';

export class DiscountService {
  private globalCouponsGenerated = 0;
  private userCouponsGenerated: Map<string, number> = new Map();

  constructor(
    private discountRepository: IDiscountRepository,
    private orderRepository: IOrderRepository
  ) {}

  public async isEligibleForCoupon(customerId: string): Promise<boolean> {
    const orders = await this.orderRepository.findByUserId(customerId);
    const successfulOrders = orders.filter(order => order.status === 'COMPLETED');
    const milestonesAchieved = Math.floor(successfulOrders.length / env.NTH_ORDER);
    const generatedForUser = this.userCouponsGenerated.get(customerId) || 0;

    return milestonesAchieved > generatedForUser;
  }

  public async isGlobalEligibleForCoupon(): Promise<boolean> {
    const orders = await this.orderRepository.findAll();
    const successfulOrders = orders.filter(order => order.status === 'COMPLETED');
    const milestonesAchieved = Math.floor(successfulOrders.length / env.NTH_ORDER);

    return milestonesAchieved > this.globalCouponsGenerated;
  }

  public async generateAdminCoupon(): Promise<DiscountCode | null> {
    const isEligible = await this.isGlobalEligibleForCoupon();
    if (!isEligible) return null;
    
    this.globalCouponsGenerated++;
    return this.createNewCoupon();
  }

  public async generateCoupon(customerId: string): Promise<DiscountCode | null> {
    const isEligible = await this.isEligibleForCoupon(customerId);
    if (!isEligible) return null;
    
    const currentCount = this.userCouponsGenerated.get(customerId) || 0;
    this.userCouponsGenerated.set(customerId, currentCount + 1);
    return this.createNewCoupon();
  }

  private async createNewCoupon(): Promise<DiscountCode> {
    const code = uuidv4().substring(0, 8).toUpperCase();
    
    const newCoupon: DiscountCode = {
      code,
      percentage: env.DISCOUNT_PERCENTAGE,
      status: 'ACTIVE',
      generatedAt: new Date(),
      usageCount: 0,
      usageLimit: 1,
    };

    return await this.discountRepository.create(newCoupon);
  }

  public async validateCoupon(code: string): Promise<DiscountCode> {
    const coupon = await this.discountRepository.findByCode(code);

    if (!coupon) {
      throw new NotFoundError('Invalid coupon code');
    }

    if (coupon.status !== 'ACTIVE') {
      throw new ValidationError(`Coupon is ${coupon.status.toLowerCase()}`);
    }

    if (coupon.expiryDate && new Date() > new Date(coupon.expiryDate)) {
      throw new ValidationError('Coupon has expired');
    }

    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      throw new ValidationError('Coupon usage limit reached');
    }

    return coupon;
  }

  public async markCouponUsed(code: string): Promise<DiscountCode> {
    // validate first to ensure it exists and is valid
    const coupon = await this.validateCoupon(code);

    const newUsageCount = coupon.usageCount + 1;
    let newStatus = coupon.status;
    
    if (coupon.usageLimit && newUsageCount >= coupon.usageLimit) {
      newStatus = 'USED';
    }

    const updatedCoupon = await this.discountRepository.update(code, { 
      usageCount: newUsageCount,
      status: newStatus
    });
    
    if (!updatedCoupon) {
      throw new NotFoundError('Coupon code not found during update');
    }

    return updatedCoupon;
  }

  public async getAllCoupons(): Promise<DiscountCode[]> {
    return await this.discountRepository.findAll();
  }

  public async createManualCoupon(data: { code: string; percentage: number; expiryDate?: Date; usageLimit?: number }): Promise<DiscountCode> {
    const existing = await this.discountRepository.findByCode(data.code);
    if (existing) {
      throw new ValidationError('Coupon code already exists');
    }

    const newCoupon: DiscountCode = {
      code: data.code,
      percentage: data.percentage,
      status: 'ACTIVE',
      generatedAt: new Date(),
      expiryDate: data.expiryDate,
      usageCount: 0,
      usageLimit: data.usageLimit,
    };

    return await this.discountRepository.create(newCoupon);
  }

  public async disableCoupon(code: string): Promise<DiscountCode> {
    const coupon = await this.discountRepository.findByCode(code);
    if (!coupon) throw new NotFoundError('Coupon code not found');

    const updated = await this.discountRepository.update(code, { status: 'DISABLED' });
    if (!updated) throw new NotFoundError('Failed to disable coupon');
    
    return updated;
  }

  public async deleteCoupon(code: string): Promise<boolean> {
    const coupon = await this.discountRepository.findByCode(code);
    if (!coupon) throw new NotFoundError('Coupon code not found');

    return await this.discountRepository.delete(code);
  }
}
