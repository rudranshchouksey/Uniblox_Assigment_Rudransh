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

    it('should return true for every 3rd successful order', async () => {
      await orderRepo.create(createMockOrder('order-1', 'cust-1', 'COMPLETED'));
      await orderRepo.create(createMockOrder('order-2', 'cust-1', 'COMPLETED'));
      await orderRepo.create(createMockOrder('order-3', 'cust-1', 'COMPLETED'));
      
      let isEligible = await discountService.isEligibleForCoupon('cust-1');
      expect(isEligible).toBe(true);

      await orderRepo.create(createMockOrder('order-4', 'cust-1', 'COMPLETED'));
      await orderRepo.create(createMockOrder('order-5', 'cust-1', 'COMPLETED'));
      isEligible = await discountService.isEligibleForCoupon('cust-1');
      expect(isEligible).toBe(false);

      await orderRepo.create(createMockOrder('order-6', 'cust-1', 'COMPLETED'));
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

    it('should generate and store a coupon if user is eligible', async () => {
      await orderRepo.create(createMockOrder('order-1', 'cust-1', 'COMPLETED'));
      await orderRepo.create(createMockOrder('order-2', 'cust-1', 'COMPLETED'));
      await orderRepo.create(createMockOrder('order-3', 'cust-1', 'COMPLETED'));
      
      const coupon = await discountService.generateCoupon('cust-1');
      expect(coupon).not.toBeNull();
      expect(coupon?.percentage).toBe(10);
      expect(coupon?.used).toBe(false);
      expect(coupon?.code).toBeDefined();

      const storedCoupon = await discountRepo.findByCode(coupon!.code);
      expect(storedCoupon).toEqual(coupon);
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
