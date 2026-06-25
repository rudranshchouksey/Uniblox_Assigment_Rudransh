import { DiscountCode } from '../models';

export interface IDiscountRepository {
  findByCode(code: string): Promise<DiscountCode | null>;
  findAll(): Promise<DiscountCode[]>;
  create(discountCode: DiscountCode): Promise<DiscountCode>;
  update(code: string, updates: Partial<Omit<DiscountCode, 'code'>>): Promise<DiscountCode | null>;
  delete(code: string): Promise<boolean>;
}

export class InMemoryDiscountRepository implements IDiscountRepository {
  private discountCodes: Map<string, DiscountCode>;

  constructor(initialData: DiscountCode[] = []) {
    this.discountCodes = new Map();
    initialData.forEach(dc => this.discountCodes.set(dc.code, dc));
  }

  async findByCode(code: string): Promise<DiscountCode | null> {
    return this.discountCodes.get(code) || null;
  }

  async findAll(): Promise<DiscountCode[]> {
    return Array.from(this.discountCodes.values());
  }

  async create(discountCode: DiscountCode): Promise<DiscountCode> {
    this.discountCodes.set(discountCode.code, discountCode);
    return discountCode;
  }

  async update(code: string, updates: Partial<Omit<DiscountCode, 'code'>>): Promise<DiscountCode | null> {
    const existing = this.discountCodes.get(code);
    if (!existing) return null;

    const updated = { ...existing, ...updates };
    this.discountCodes.set(code, updated);
    return updated;
  }

  async delete(code: string): Promise<boolean> {
    return this.discountCodes.delete(code);
  }
}
