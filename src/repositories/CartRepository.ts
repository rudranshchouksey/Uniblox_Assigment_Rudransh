import { Cart } from '../models';

export interface ICartRepository {
  findByUserId(userId: string): Promise<Cart | null>;
  create(cart: Cart): Promise<Cart>;
  update(userId: string, updates: Partial<Omit<Cart, 'id' | 'userId'>>): Promise<Cart | null>;
  delete(userId: string): Promise<boolean>;
}

export class InMemoryCartRepository implements ICartRepository {
  // Using userId as the Map key for quick access since 1 user = 1 cart
  private carts: Map<string, Cart>;

  constructor() {
    this.carts = new Map();
  }

  async findByUserId(userId: string): Promise<Cart | null> {
    return this.carts.get(userId) || null;
  }

  async create(cart: Cart): Promise<Cart> {
    this.carts.set(cart.userId, cart);
    return cart;
  }

  async update(userId: string, updates: Partial<Omit<Cart, 'id' | 'userId'>>): Promise<Cart | null> {
    const existing = this.carts.get(userId);
    if (!existing) return null;

    const updated = { ...existing, ...updates };
    this.carts.set(userId, updated);
    return updated;
  }

  async delete(userId: string): Promise<boolean> {
    return this.carts.delete(userId);
  }
}
