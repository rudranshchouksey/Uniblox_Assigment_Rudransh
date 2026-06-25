import { describe, it, expect, beforeEach } from 'vitest';
import { AnalyticsService } from '../../src/services/AnalyticsService';
import { InMemoryOrderRepository } from '../../src/repositories/OrderRepository';
import { InMemoryDiscountRepository } from '../../src/repositories/DiscountRepository';
import { Order, DiscountCode } from '../../src/models';

describe('AnalyticsService', () => {
  let orderRepo: InMemoryOrderRepository;
  let discountRepo: InMemoryDiscountRepository;
  let analyticsService: AnalyticsService;

  beforeEach(() => {
    orderRepo = new InMemoryOrderRepository();
    discountRepo = new InMemoryDiscountRepository();
    analyticsService = new AnalyticsService(orderRepo, discountRepo);
  });

  const createMockOrder = (
    id: string, 
    status: Order['status'], 
    itemsQty: number, 
    subtotal: number, 
    discount: number
  ): Order => ({
    id,
    userId: 'cust-1',
    status,
    items: [{ productId: 'p1', quantity: itemsQty, priceAtPurchase: 100 }],
    subtotal,
    discountAmount: discount,
    totalAmount: subtotal - discount,
    createdAt: new Date(),
  });

  describe('getStats', () => {
    it('should return zeros when there are no orders and no discounts', async () => {
      const stats = await analyticsService.getStats();

      expect(stats.totalOrders).toBe(0);
      expect(stats.itemsPurchased).toBe(0);
      expect(stats.totalRevenue).toBe(0);
      expect(stats.totalDiscountGiven).toBe(0);
      expect(stats.discountCodes).toHaveLength(0);
    });

    it('should aggregate only COMPLETED orders correctly', async () => {
      await orderRepo.create(createMockOrder('order-1', 'COMPLETED', 2, 200, 20)); // rev: 180
      await orderRepo.create(createMockOrder('order-2', 'COMPLETED', 1, 100, 0));  // rev: 100
      await orderRepo.create(createMockOrder('order-3', 'PENDING', 5, 500, 0));    // ignored
      await orderRepo.create(createMockOrder('order-4', 'CANCELLED', 1, 100, 0));  // ignored

      await discountRepo.create({ code: 'CODE1', percentage: 10, used: true, generatedAt: new Date() });

      const stats = await analyticsService.getStats();

      expect(stats.totalOrders).toBe(2);
      expect(stats.itemsPurchased).toBe(3); // 2 + 1
      expect(stats.totalRevenue).toBe(280); // 180 + 100
      expect(stats.totalDiscountGiven).toBe(20);
      expect(stats.discountCodes).toHaveLength(1);
      expect(stats.discountCodes[0].code).toBe('CODE1');
    });
  });
});
