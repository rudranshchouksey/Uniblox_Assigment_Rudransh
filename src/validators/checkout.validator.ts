import { z } from 'zod';

export const checkoutSchema = z.object({
  body: z.object({
    customerId: z.string({ required_error: 'Customer ID is required' }),
    discountCode: z.string().optional(),
  }),
});
