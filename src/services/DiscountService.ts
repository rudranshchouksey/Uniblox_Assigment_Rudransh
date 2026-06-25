import { DiscountCode } from '../models';
import { IDiscountRepository } from '../repositories/DiscountRepository';
import { IOrderRepository } from '../repositories/OrderRepository';
import { ValidationError, NotFoundError } from '../errors/AppError';
import { v4 as uuidv4 } from 'uuid';

export class DiscountService {
  private readonly NTH_ORDER = 3;
  private readonly DISCOUNT_PERCENTAGE = 10;

  constructor(
    private discountRepository: IDiscountRepository,
    private orderRepository: IOrderRepository
  ) {}

  public async isEligibleForCoupon(customerId: string): Promise<boolean> {
    const orders = await this.orderRepository.findByUserId(customerId);
    const successfulOrders = orders.filter(order => order.status === 'COMPLETED');

    return successfulOrders.length > 0 && (successfulOrders.length % this.NTH_ORDER === 0);
  }

  public async isGlobalEligibleForCoupon(): Promise<boolean> {
    const orders = await this.orderRepository.findAll();
    const successfulOrders = orders.filter(order => order.status === 'COMPLETED');

    return successfulOrders.length > 0 && (successfulOrders.length % this.NTH_ORDER === 0);
  }

  public async generateAdminCoupon(): Promise<DiscountCode | null> {
    const isEligible = await this.isGlobalEligibleForCoupon();
    if (!isEligible) return null;
    return this.createNewCoupon();
  }

  public async generateCoupon(customerId: string): Promise<DiscountCode | null> {
    const isEligible = await this.isEligibleForCoupon(customerId);
    if (!isEligible) return null;
    return this.createNewCoupon();
  }

  private async createNewCoupon(): Promise<DiscountCode> {
    const code = uuidv4().substring(0, 8).toUpperCase();
    
    const newCoupon: DiscountCode = {
      code,
      percentage: this.DISCOUNT_PERCENTAGE,
      used: false,
      generatedAt: new Date(),
    };

    return await this.discountRepository.create(newCoupon);
  }

  public async validateCoupon(code: string): Promise<DiscountCode> {
    const coupon = await this.discountRepository.findByCode(code);

    if (!coupon) {
      throw new NotFoundError('Invalid coupon code');
    }

    if (coupon.used) {
      throw new ValidationError('Coupon code has already been used');
    }

    return coupon;
  }

  public async markCouponUsed(code: string): Promise<DiscountCode> {
    // validate first to ensure it exists and is not used
    await this.validateCoupon(code);

    const updatedCoupon = await this.discountRepository.update(code, { used: true });
    
    if (!updatedCoupon) {
      throw new NotFoundError('Coupon code not found during update');
    }

    return updatedCoupon;
  }
}
