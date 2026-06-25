import { describe, it, expect, beforeEach } from 'vitest';
import { CartService } from '../../src/services/CartService';
import { InMemoryCartRepository } from '../../src/repositories/CartRepository';
import { InMemoryProductRepository } from '../../src/repositories/ProductRepository';
import { NotFoundError, ValidationError } from '../../src/errors/AppError';
import { Product } from '../../src/models';

describe('CartService', () => {
  let cartService: CartService;
  let cartRepo: InMemoryCartRepository;
  let productRepo: InMemoryProductRepository;

  const mockProduct: Product = {
    id: 'prod-1',
    name: 'Test Product',
    description: 'Test Desc',
    price: 100,
    stock: 10,
  };

  beforeEach(() => {
    cartRepo = new InMemoryCartRepository();
    productRepo = new InMemoryProductRepository([mockProduct]);
    cartService = new CartService(cartRepo, productRepo);
  });

  describe('getCart', () => {
    it('should create a new cart if it does not exist', async () => {
      const cart = await cartService.getCart('customer-1');
      expect(cart.userId).toBe('customer-1');
      expect(cart.items).toHaveLength(0);
    });

    it('should return existing cart', async () => {
      await cartService.getCart('customer-1');
      const cart = await cartService.getCart('customer-1');
      expect(cart.userId).toBe('customer-1');
    });
  });

  describe('addItem', () => {
    it('should add a new item to the cart', async () => {
      const cart = await cartService.addItem('customer-1', 'prod-1', 2);
      expect(cart.items).toHaveLength(1);
      expect(cart.items[0]).toEqual({ productId: 'prod-1', quantity: 2 });
    });

    it('should increase quantity if product already in cart', async () => {
      await cartService.addItem('customer-1', 'prod-1', 2);
      const cart = await cartService.addItem('customer-1', 'prod-1', 3);
      expect(cart.items).toHaveLength(1);
      expect(cart.items[0].quantity).toBe(5);
    });

    it('should throw ValidationError if quantity is 0 or less', async () => {
      await expect(cartService.addItem('customer-1', 'prod-1', 0)).rejects.toThrow(ValidationError);
      await expect(cartService.addItem('customer-1', 'prod-1', -1)).rejects.toThrow(ValidationError);
    });

    it('should throw NotFoundError if product does not exist', async () => {
      await expect(cartService.addItem('customer-1', 'invalid-prod', 1)).rejects.toThrow(NotFoundError);
    });
  });

  describe('updateItemQuantity', () => {
    it('should update the quantity of an existing item', async () => {
      await cartService.addItem('customer-1', 'prod-1', 2);
      const cart = await cartService.updateItemQuantity('customer-1', 'prod-1', 5);
      expect(cart.items[0].quantity).toBe(5);
    });

    it('should remove the item if quantity is set to 0', async () => {
      await cartService.addItem('customer-1', 'prod-1', 2);
      const cart = await cartService.updateItemQuantity('customer-1', 'prod-1', 0);
      expect(cart.items).toHaveLength(0);
    });

    it('should throw ValidationError if quantity is negative', async () => {
      await expect(cartService.updateItemQuantity('customer-1', 'prod-1', -5)).rejects.toThrow(ValidationError);
    });

    it('should throw NotFoundError if item is not in cart', async () => {
      await expect(cartService.updateItemQuantity('customer-1', 'prod-1', 5)).rejects.toThrow(NotFoundError);
    });
  });

  describe('removeItem', () => {
    it('should remove an item from the cart', async () => {
      await cartService.addItem('customer-1', 'prod-1', 2);
      const cart = await cartService.removeItem('customer-1', 'prod-1');
      expect(cart.items).toHaveLength(0);
    });

    it('should throw NotFoundError if item to remove is not in cart', async () => {
      await expect(cartService.removeItem('customer-1', 'prod-1')).rejects.toThrow(NotFoundError);
    });
  });
});
