import { z } from 'zod';

export const checkoutSchema = z.object({
  body: z.object({
    customerId: z.string({ message: 'Customer ID is required' }),
    discountCode: z.string().optional(),
  }),
});
