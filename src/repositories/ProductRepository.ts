import { Product } from '../models';

export interface IProductRepository {
  findById(id: string): Promise<Product | null>;
  findAll(): Promise<Product[]>;
  create(product: Product): Promise<Product>;
  update(id: string, updates: Partial<Omit<Product, 'id'>>): Promise<Product | null>;
  delete(id: string): Promise<boolean>;
}

export class InMemoryProductRepository implements IProductRepository {
  private products: Map<string, Product>;

  constructor(initialData: Product[] = []) {
    this.products = new Map();
    initialData.forEach(p => this.products.set(p.id, p));
  }

  async findById(id: string): Promise<Product | null> {
    return this.products.get(id) || null;
  }

  async findAll(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async create(product: Product): Promise<Product> {
    this.products.set(product.id, product);
    return product;
  }

  async update(id: string, updates: Partial<Omit<Product, 'id'>>): Promise<Product | null> {
    const existing = this.products.get(id);
    if (!existing) return null;
    
    const updated = { ...existing, ...updates };
    this.products.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    return this.products.delete(id);
  }
}
