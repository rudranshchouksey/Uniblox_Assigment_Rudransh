import { z } from 'zod';

export const addToCartSchema = z.object({
  body: z.object({
    customerId: z.string({ required_error: 'Customer ID is required' }),
    productId: z.string({ required_error: 'Product ID is required' }),
    quantity: z.number().int().positive('Quantity must be greater than 0'),
  }),
});

export const updateCartItemSchema = z.object({
  params: z.object({
    productId: z.string({ required_error: 'Product ID is required' }),
  }),
  body: z.object({
    customerId: z.string({ required_error: 'Customer ID is required' }),
    quantity: z.number().int().min(0, 'Quantity must be 0 or greater'),
  }),
});

export const removeCartItemSchema = z.object({
  params: z.object({
    productId: z.string({ required_error: 'Product ID is required' }),
  }),
  body: z.object({
    customerId: z.string({ required_error: 'Customer ID is required' }),
  }),
});

export const getCartSchema = z.object({
  params: z.object({
    customerId: z.string({ required_error: 'Customer ID is required' }),
  }),
});
