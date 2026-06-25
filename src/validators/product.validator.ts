import { z } from 'zod';

export const createProductSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    description: z.string().min(1, 'Description is required'),
    price: z.number().positive('Price must be greater than zero'),
    stock: z.number().int().nonnegative('Stock cannot be negative'),
    category: z.string().optional(),
    image: z.string().url('Must be a valid URL').optional(),
  }),
});

export const updateProductSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required').optional(),
    description: z.string().min(1, 'Description is required').optional(),
    price: z.number().positive('Price must be greater than zero').optional(),
    stock: z.number().int().nonnegative('Stock cannot be negative').optional(),
    category: z.string().optional(),
    image: z.string().url('Must be a valid URL').optional(),
  }),
});
