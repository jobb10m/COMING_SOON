import { z } from 'zod';

export const createPaymentSchema = z.object({
  body: z.object({
    memberId: z.string().uuid(),
    membershipId: z.string().uuid().optional(),
    amount: z.number().positive(),
    method: z.enum(['CASH', 'BANK', 'TELEBIRR', 'CBE_BIRR', 'CHAPA']),
    status: z.enum(['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED']).optional(),
    reference: z.string().optional(),
  }),
});
