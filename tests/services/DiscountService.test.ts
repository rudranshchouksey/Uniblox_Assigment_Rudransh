import { describe, it, expect, beforeEach } from 'vitest';
import { DiscountService } from '../../src/services/DiscountService';
import { InMemoryDiscountRepository } from '../../src/repositories/DiscountRepository';
import { InMemoryOrderRepository } from '../../src/repositories/OrderRepository';
import { Order, DiscountCode } from '../../src/models';
import { ValidationError, NotFoundError } from '../../src/errors/AppError';

describe('DiscountService', () => {
  let discountService: DiscountService;
  let discountRepo: InMemoryDiscountRepository;
  let orderRepo: InMemoryOrderRepository;

  beforeEach(() => {
    discountRepo = new InMemoryDiscountRepository();
    orderRepo = new InMemoryOrderRepository();
    discountService = new DiscountService(discountRepo, orderRepo);
  });

  const createMockOrder = (id: string, userId: string, status: Order['status']): Order => ({
    id,
    userId,
    status,
    items: [],
    subtotal: 0,
    discountAmount: 0,
    totalAmount: 0,
    createdAt: new Date(),
  });

  describe('isEligibleForCoupon', () => {
    it('should return false if no orders exist', async () => {
      const isEligible = await discountService.isEligibleForCoupon('cust-1');
      expect(isEligible).toBe(false);
    });

    it('should return false if there are less than 3 successful orders', async () => {
      await orderRepo.create(createMockOrder('order-1', 'cust-1', 'COMPLETED'));
      await orderRepo.create(createMockOrder('order-2', 'cust-1', 'COMPLETED'));
      const isEligible = await discountService.isEligibleForCoupon('cust-1');
      expect(isEligible).toBe(false);
    });

    it('should return true when a milestone is reached and remain true until claimed', async () => {
      await orderRepo.create(createMockOrder('order-1', 'cust-1', 'COMPLETED'));
      await orderRepo.create(createMockOrder('order-2', 'cust-1', 'COMPLETED'));
      await orderRepo.create(createMockOrder('order-3', 'cust-1', 'COMPLETED'));
      
      let isEligible = await discountService.isEligibleForCoupon('cust-1');
      expect(isEligible).toBe(true);

      await orderRepo.create(createMockOrder('order-4', 'cust-1', 'COMPLETED'));
      await orderRepo.create(createMockOrder('order-5', 'cust-1', 'COMPLETED'));
      
      // Still true because the milestone was never consumed (coupon never generated)
      isEligible = await discountService.isEligibleForCoupon('cust-1');
      expect(isEligible).toBe(true);
    });

    it('should ignore non-completed orders in eligibility check', async () => {
      await orderRepo.create(createMockOrder('order-1', 'cust-1', 'COMPLETED'));
      await orderRepo.create(createMockOrder('order-2', 'cust-1', 'COMPLETED'));
      await orderRepo.create(createMockOrder('order-3', 'cust-1', 'PENDING')); // not completed
      
      const isEligible = await discountService.isEligibleForCoupon('cust-1');
      expect(isEligible).toBe(false);
    });
  });

  describe('generateCoupon', () => {
    it('should return null if user is not eligible', async () => {
      const coupon = await discountService.generateCoupon('cust-1');
      expect(coupon).toBeNull();
    });

    it('should generate a coupon only once per milestone', async () => {
      await orderRepo.create(createMockOrder('order-1', 'cust-1', 'COMPLETED'));
      await orderRepo.create(createMockOrder('order-2', 'cust-1', 'COMPLETED'));
      await orderRepo.create(createMockOrder('order-3', 'cust-1', 'COMPLETED'));
      
      const coupon = await discountService.generateCoupon('cust-1');
      expect(coupon).not.toBeNull();
      
      // Attempt to generate again for the same milestone
      const coupon2 = await discountService.generateCoupon('cust-1');
      expect(coupon2).toBeNull(); // Exploit prevented

      // Add 3 more orders to reach next milestone
      await orderRepo.create(createMockOrder('order-4', 'cust-1', 'COMPLETED'));
      await orderRepo.create(createMockOrder('order-5', 'cust-1', 'COMPLETED'));
      await orderRepo.create(createMockOrder('order-6', 'cust-1', 'COMPLETED'));

      const coupon3 = await discountService.generateCoupon('cust-1');
      expect(coupon3).not.toBeNull();
    });
  });

  describe('validateCoupon', () => {
    it('should throw NotFoundError if coupon does not exist', async () => {
      await expect(discountService.validateCoupon('INVALID')).rejects.toThrow(NotFoundError);
    });

    it('should throw ValidationError if coupon is already used', async () => {
      await discountRepo.create({
        code: 'USED_CODE',
        percentage: 10,
        used: true,
        generatedAt: new Date(),
      });

      await expect(discountService.validateCoupon('USED_CODE')).rejects.toThrow(ValidationError);
    });

    it('should return the coupon if it is valid and unused', async () => {
      await discountRepo.create({
        code: 'VALID_CODE',
        percentage: 10,
        used: false,
        generatedAt: new Date(),
      });

      const coupon = await discountService.validateCoupon('VALID_CODE');
      expect(coupon.code).toBe('VALID_CODE');
      expect(coupon.used).toBe(false);
    });
  });

  describe('markCouponUsed', () => {
    it('should mark an unused coupon as used', async () => {
      await discountRepo.create({
        code: 'VALID_CODE',
        percentage: 10,
        used: false,
        generatedAt: new Date(),
      });

      const updatedCoupon = await discountService.markCouponUsed('VALID_CODE');
      expect(updatedCoupon.used).toBe(true);

      const storedCoupon = await discountRepo.findByCode('VALID_CODE');
      expect(storedCoupon?.used).toBe(true);
    });

    it('should throw error if attempting to mark an already used coupon', async () => {
      await discountRepo.create({
        code: 'USED_CODE',
        percentage: 10,
        used: true,
        generatedAt: new Date(),
      });

      await expect(discountService.markCouponUsed('USED_CODE')).rejects.toThrow(ValidationError);
    });
  });
});
