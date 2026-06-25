export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
}

export interface CartItem {
  productId: string;
  quantity: number;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  discountCode?: string;
}

export interface OrderItem {
  productId: string;
  quantity: number;
  priceAtPurchase: number; // Snapshot of the price to prevent historical changes
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  subtotal: number; // Before discount
  discountAmount: number; // Amount discounted
  totalAmount: number; // Final amount
  discountApplied?: string;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  createdAt: Date;
}

export interface DiscountCode {
  code: string;
  type: 'PERCENTAGE' | 'FIXED';
  value: number; // e.g. 10 for 10% or 10 for $10 off
  isActive: boolean;
}
