import { Product, DiscountCode } from '../models';
import { InMemoryProductRepository } from '../repositories/ProductRepository';
import { InMemoryCartRepository } from '../repositories/CartRepository';
import { InMemoryOrderRepository } from '../repositories/OrderRepository';
import { InMemoryDiscountRepository } from '../repositories/DiscountRepository';

// Seed Products
const seedProducts: Product[] = [
  {
    id: 'prod_1',
    name: 'Wireless Noise-Canceling Headphones',
    description: 'High quality over-ear headphones with active noise cancellation.',
    price: 299.99,
    stock: 50,
  },
  {
    id: 'prod_2',
    name: 'Ergonomic Mechanical Keyboard',
    description: 'Split design mechanical keyboard for ultimate typing comfort.',
    price: 149.50,
    stock: 200,
  },
  {
    id: 'prod_3',
    name: '4K Ultra HD Monitor',
    description: '27-inch IPS panel with 99% sRGB color accuracy.',
    price: 399.00,
    stock: 30,
  },
  {
    id: 'prod_4',
    name: 'USB-C Docking Station',
    description: '10-in-1 hub with HDMI, Ethernet, and 100W PD.',
    price: 89.99,
    stock: 120,
  },
  {
    id: 'prod_5',
    name: 'Wireless Gaming Mouse',
    description: 'Ultra-lightweight mouse with 20K DPI optical sensor.',
    price: 79.99,
    stock: 75,
  },
];

// Seed Discount Codes
const seedDiscounts: DiscountCode[] = [
  {
    code: 'WELCOME10',
    percentage: 10,
    used: false,
    generatedAt: new Date(),
  },
  {
    code: 'TESTUSED10',
    percentage: 10,
    used: true,
    generatedAt: new Date(Date.now() - 86400000), // 1 day ago
  }
];

// Export Singleton Repositories initialized with seed data
export const productRepository = new InMemoryProductRepository(seedProducts);
export const cartRepository = new InMemoryCartRepository();
export const orderRepository = new InMemoryOrderRepository();
export const discountRepository = new InMemoryDiscountRepository(seedDiscounts);
