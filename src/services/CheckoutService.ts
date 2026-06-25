import { ICartRepository } from '../repositories/CartRepository';
import { IProductRepository } from '../repositories/ProductRepository';
import { IOrderRepository } from '../repositories/OrderRepository';
import { DiscountService } from './DiscountService';
import { Order, OrderItem } from '../models';
import { ValidationError, NotFoundError } from '../errors/AppError';
import { v4 as uuidv4 } from 'uuid';

export class CheckoutService {
  constructor(
    private cartRepository: ICartRepository,
    private productRepository: IProductRepository,
    private orderRepository: IOrderRepository,
    private discountService: DiscountService
  ) {}

  public async checkout(customerId: string, discountCode?: string) {
    // 1. Fetch customer cart.
    const cart = await this.cartRepository.findByUserId(customerId);

    // 2. Ensure cart is not empty.
    if (!cart || cart.items.length === 0) {
      throw new ValidationError('Cart is empty');
    }

    // 3. Calculate subtotal & Create Snapshot
    let subtotal = 0;
    const orderItems: OrderItem[] = [];

    for (const item of cart.items) {
      const product = await this.productRepository.findById(item.productId);
      if (!product) {
        throw new NotFoundError(`Product with ID ${item.productId} no longer exists`);
      }
      
      const priceAtPurchase = product.price;
      subtotal += priceAtPurchase * item.quantity;
      
      orderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        priceAtPurchase
      });
    }

    // 4. Validate coupon if provided.
    // 5. Apply discount.
    let discountAmount = 0;
    let appliedCoupon: string | undefined = undefined;

    if (discountCode) {
      const coupon = await this.discountService.validateCoupon(discountCode);
      discountAmount = subtotal * (coupon.percentage / 100);
      appliedCoupon = coupon.code;
    }

    const totalAmount = subtotal - discountAmount;

    // 6. Create order.
    const newOrder: Order = {
      id: uuidv4(),
      userId: customerId,
      items: orderItems,
      subtotal,
      discountAmount,
      totalAmount,
      discountApplied: appliedCoupon,
      status: 'COMPLETED',
      createdAt: new Date()
    };

    const order = await this.orderRepository.create(newOrder);

    // 7. Clear cart.
    await this.cartRepository.update(customerId, { items: [] });

    // 8. Update analytics.
    this.updateAnalytics(order);

    // 9. Mark coupon as used.
    if (appliedCoupon) {
      await this.discountService.markCouponUsed(appliedCoupon);
    }

    // 10. Return order summary.
    return {
      orderId: order.id,
      subtotal: order.subtotal,
      discountAmount: order.discountAmount,
      total: order.totalAmount,
      items: order.items,
      appliedCoupon: order.discountApplied,
      createdAt: order.createdAt
    };
  }

  private updateAnalytics(order: Order) {
    // In a real scenario, this might emit an event to an event bus or call an external analytics API
    console.log(`[Analytics] Order ${order.id} processed successfully for customer ${order.userId}. Revenue: $${order.totalAmount.toFixed(2)}`);
  }
}
