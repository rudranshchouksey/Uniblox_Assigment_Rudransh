import { Order } from '../models';

export interface IOrderRepository {
  findById(id: string): Promise<Order | null>;
  findByUserId(userId: string): Promise<Order[]>;
  create(order: Order): Promise<Order>;
  updateStatus(id: string, status: Order['status']): Promise<Order | null>;
}

export class InMemoryOrderRepository implements IOrderRepository {
  private orders: Map<string, Order>;

  constructor() {
    this.orders = new Map();
  }

  async findById(id: string): Promise<Order | null> {
    return this.orders.get(id) || null;
  }

  async findByUserId(userId: string): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(order => order.userId === userId);
  }

  async create(order: Order): Promise<Order> {
    this.orders.set(order.id, order);
    return order;
  }

  async updateStatus(id: string, status: Order['status']): Promise<Order | null> {
    const existing = this.orders.get(id);
    if (!existing) return null;

    const updated = { ...existing, status };
    this.orders.set(id, updated);
    return updated;
  }
}
