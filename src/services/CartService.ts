import { Cart, CartItem } from '../models';
import { ICartRepository } from '../repositories/CartRepository';
import { IProductRepository } from '../repositories/ProductRepository';
import { NotFoundError, ValidationError } from '../errors/AppError';
import { v4 as uuidv4 } from 'uuid';

export class CartService {
  constructor(
    private cartRepository: ICartRepository,
    private productRepository: IProductRepository
  ) {}

  public async getCart(customerId: string): Promise<Cart> {
    let cart = await this.cartRepository.findByUserId(customerId);
    
    if (!cart) {
      cart = await this.cartRepository.create({
        id: uuidv4(),
        userId: customerId,
        items: []
      });
    }

    return cart;
  }

  public async addItem(customerId: string, productId: string, quantity: number): Promise<Cart> {
    if (quantity <= 0) {
      throw new ValidationError('Quantity must be greater than 0');
    }

    const product = await this.productRepository.findById(productId);
    if (!product) {
      throw new NotFoundError('Product not found');
    }

    const cart = await this.getCart(customerId);
    const existingItemIndex = cart.items.findIndex(item => item.productId === productId);

    if (existingItemIndex > -1) {
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      cart.items.push({ productId, quantity });
    }

    const updatedCart = await this.cartRepository.update(customerId, { items: cart.items });
    return updatedCart!;
  }

  public async updateItemQuantity(customerId: string, productId: string, quantity: number): Promise<Cart> {
    if (quantity < 0) {
      throw new ValidationError('Quantity cannot be negative');
    }

    if (quantity === 0) {
      return this.removeItem(customerId, productId);
    }

    const product = await this.productRepository.findById(productId);
    if (!product) {
      throw new NotFoundError('Product not found');
    }

    const cart = await this.getCart(customerId);
    const existingItemIndex = cart.items.findIndex(item => item.productId === productId);

    if (existingItemIndex === -1) {
      throw new NotFoundError('Item not found in cart');
    }

    cart.items[existingItemIndex].quantity = quantity;

    const updatedCart = await this.cartRepository.update(customerId, { items: cart.items });
    return updatedCart!;
  }

  public async removeItem(customerId: string, productId: string): Promise<Cart> {
    const cart = await this.getCart(customerId);
    
    const initialLength = cart.items.length;
    cart.items = cart.items.filter(item => item.productId !== productId);

    if (cart.items.length === initialLength) {
      throw new NotFoundError('Item not found in cart');
    }

    const updatedCart = await this.cartRepository.update(customerId, { items: cart.items });
    return updatedCart!;
  }
}
