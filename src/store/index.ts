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
    description: 'High quality over-ear headphones with active noise cancellation and 30-hour battery life.',
    category: 'Audio',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600&auto=format&fit=crop',
    price: 299.99,
    stock: 50,
  },
  {
    id: 'prod_2',
    name: 'Ergonomic Mechanical Keyboard',
    description: 'Split design mechanical keyboard with tactile switches for ultimate typing comfort.',
    category: 'Peripherals',
    image: 'https://images.unsplash.com/photo-1595225476474-87563907a212?q=80&w=600&auto=format&fit=crop',
    price: 149.50,
    stock: 200,
  },
  {
    id: 'prod_3',
    name: '4K Ultra HD Monitor',
    description: '27-inch IPS panel with 99% sRGB color accuracy. Perfect for creative professionals.',
    category: 'Displays',
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=80&w=600&auto=format&fit=crop',
    price: 399.00,
    stock: 30,
  },
  {
    id: 'prod_4',
    name: 'USB-C Docking Station',
    description: '10-in-1 aluminum hub with HDMI, Ethernet, and 100W Power Delivery.',
    category: 'Accessories',
    image: 'https://images.unsplash.com/photo-1592286927505-1def25115558?q=80&w=600&auto=format&fit=crop',
    price: 89.99,
    stock: 120,
  },
  {
    id: 'prod_5',
    name: 'Wireless Gaming Mouse',
    description: 'Ultra-lightweight mouse with 20K DPI optical sensor and 70-hour battery.',
    category: 'Peripherals',
    image: 'https://images.unsplash.com/photo-1527814050087-379381547938?q=80&w=600&auto=format&fit=crop',
    price: 79.99,
    stock: 75,
  },
  {
    id: 'prod_6',
    name: 'Premium Leather Desk Mat',
    description: 'Extended size vegan leather desk pad for a smooth, elegant workspace.',
    category: 'Accessories',
    image: 'https://images.unsplash.com/photo-1628126235206-5260b9ea6441?q=80&w=600&auto=format&fit=crop',
    price: 39.99,
    stock: 150,
  },
  {
    id: 'prod_7',
    name: 'Studio Condenser Microphone',
    description: 'USB microphone with cardioid polar pattern for crisp, professional audio recording.',
    category: 'Audio',
    image: 'https://images.unsplash.com/photo-1598550476439-6847785fcea6?q=80&w=600&auto=format&fit=crop',
    price: 129.00,
    stock: 45,
  },
  {
    id: 'prod_8',
    name: 'Ultra-Wide Curved Monitor',
    description: '34-inch curved display with 144Hz refresh rate for immersive workflow.',
    category: 'Displays',
    image: 'https://images.unsplash.com/photo-1552831388-6a0b35077328?q=80&w=600&auto=format&fit=crop',
    price: 549.99,
    stock: 12,
  },
  {
    id: 'prod_9',
    name: 'Monitor Light Bar',
    description: 'Screen-glare free LED desk lamp to reduce eye strain during late-night sessions.',
    category: 'Accessories',
    image: 'https://images.unsplash.com/photo-1588611860087-4d76a26d705f?q=80&w=600&auto=format&fit=crop',
    price: 59.90,
    stock: 85,
  },
  {
    id: 'prod_10',
    name: 'Aluminum Laptop Stand',
    description: 'Ergonomic, adjustable stand to elevate your laptop to eye level.',
    category: 'Accessories',
    image: 'https://images.unsplash.com/photo-1625842268584-8f3296236761?q=80&w=600&auto=format&fit=crop',
    price: 45.00,
    stock: 300,
  }
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
