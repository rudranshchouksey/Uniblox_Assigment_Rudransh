import { IOrderRepository } from '../repositories/OrderRepository';
import { IDiscountRepository } from '../repositories/DiscountRepository';

export class AnalyticsService {
  constructor(
    private orderRepository: IOrderRepository,
    private discountRepository: IDiscountRepository
  ) {}

  public async getStats() {
    const orders = await this.orderRepository.findAll();
    const discountCodes = await this.discountRepository.findAll();

    let itemsPurchased = 0;
    let totalRevenue = 0;
    let totalDiscountGiven = 0;

    // Typically analytics count only COMPLETED orders
    const completedOrders = orders.filter(o => o.status === 'COMPLETED');

    for (const order of completedOrders) {
      for (const item of order.items) {
        itemsPurchased += item.quantity;
      }
      totalRevenue += order.totalAmount;
      totalDiscountGiven += order.discountAmount;
    }

    return {
      totalOrders: completedOrders.length,
      itemsPurchased,
      totalRevenue,
      totalDiscountGiven,
      discountCodes,
    };
  }
}
