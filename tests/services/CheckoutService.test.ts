import { describe, it, expect, beforeEach } from 'vitest';
import { CheckoutService } from '../../src/services/CheckoutService';
import { DiscountService } from '../../src/services/DiscountService';
import { InMemoryCartRepository } from '../../src/repositories/CartRepository';
import { InMemoryProductRepository } from '../../src/repositories/ProductRepository';
import { InMemoryOrderRepository } from '../../src/repositories/OrderRepository';
import { InMemoryDiscountRepository } from '../../src/repositories/DiscountRepository';
import { ValidationError, NotFoundError } from '../../src/errors/AppError';

describe('CheckoutService', () => {
  let cartRepo: InMemoryCartRepository;
  let productRepo: InMemoryProductRepository;
  let orderRepo: InMemoryOrderRepository;
  let discountRepo: InMemoryDiscountRepository;
  let discountService: DiscountService;
  let checkoutService: CheckoutService;

  beforeEach(() => {
    cartRepo = new InMemoryCartRepository();
    productRepo = new InMemoryProductRepository([
      { id: 'prod-1', name: 'P1', description: 'desc', price: 100, stock: 10 },
      { id: 'prod-2', name: 'P2', description: 'desc', price: 50, stock: 5 },
    ]);
    orderRepo = new InMemoryOrderRepository();
    discountRepo = new InMemoryDiscountRepository([
      { code: 'VALID10', percentage: 10, used: false, generatedAt: new Date() },
      { code: 'USED10', percentage: 10, used: true, generatedAt: new Date() },
    ]);
    discountService = new DiscountService(discountRepo, orderRepo);
    checkoutService = new CheckoutService(cartRepo, productRepo, orderRepo, discountService);
  });

  describe('checkout', () => {
    it('should throw ValidationError if cart does not exist', async () => {
      await expect(checkoutService.checkout('cust-1')).rejects.toThrow(ValidationError);
      await expect(checkoutService.checkout('cust-1')).rejects.toThrow('Cart is empty');
    });

    it('should throw ValidationError if cart is empty', async () => {
      await cartRepo.create({ id: 'cart-1', userId: 'cust-1', items: [] });
      await expect(checkoutService.checkout('cust-1')).rejects.toThrow('Cart is empty');
    });

    it('should throw NotFoundError if a product in cart no longer exists', async () => {
      await cartRepo.create({ id: 'cart-1', userId: 'cust-1', items: [{ productId: 'invalid', quantity: 1 }] });
      await expect(checkoutService.checkout('cust-1')).rejects.toThrow(NotFoundError);
    });

    it('should successfully checkout without a discount code', async () => {
      await cartRepo.create({
        id: 'cart-1',
        userId: 'cust-1',
        items: [
          { productId: 'prod-1', quantity: 2 }, // 2 * 100 = 200
          { productId: 'prod-2', quantity: 1 }, // 1 * 50 = 50
        ]
      });

      const summary = await checkoutService.checkout('cust-1');

      expect(summary.subtotal).toBe(250);
      expect(summary.discountAmount).toBe(0);
      expect(summary.total).toBe(250);
      expect(summary.items).toHaveLength(2);
      expect(summary.items[0].priceAtPurchase).toBe(100);
      expect(summary.appliedCoupon).toBeUndefined();
      
      // Verify cart is cleared
      const cartAfter = await cartRepo.findByUserId('cust-1');
      expect(cartAfter?.items).toHaveLength(0);

      // Verify order is created
      const order = await orderRepo.findById(summary.orderId);
      expect(order).not.toBeNull();
      expect(order?.status).toBe('COMPLETED');
    });

    it('should successfully checkout and apply a valid discount code', async () => {
      await cartRepo.create({
        id: 'cart-1',
        userId: 'cust-1',
        items: [{ productId: 'prod-1', quantity: 1 }] // 1 * 100 = 100
      });

      const summary = await checkoutService.checkout('cust-1', 'VALID10');

      expect(summary.subtotal).toBe(100);
      expect(summary.discountAmount).toBe(10); // 10% of 100
      expect(summary.total).toBe(90);
      expect(summary.appliedCoupon).toBe('VALID10');

      // Verify coupon is marked as used
      const coupon = await discountRepo.findByCode('VALID10');
      expect(coupon?.used).toBe(true);
    });

    it('should throw error and rollback if discount code is invalid', async () => {
      await cartRepo.create({
        id: 'cart-1',
        userId: 'cust-1',
        items: [{ productId: 'prod-1', quantity: 1 }]
      });

      await expect(checkoutService.checkout('cust-1', 'INVALID')).rejects.toThrow(NotFoundError);

      // Verify cart is NOT cleared
      const cartAfter = await cartRepo.findByUserId('cust-1');
      expect(cartAfter?.items).toHaveLength(1);
    });

    it('should throw error if discount code is already used', async () => {
      await cartRepo.create({
        id: 'cart-1',
        userId: 'cust-1',
        items: [{ productId: 'prod-1', quantity: 1 }]
      });

      await expect(checkoutService.checkout('cust-1', 'USED10')).rejects.toThrow(ValidationError);
    });
  });
});
