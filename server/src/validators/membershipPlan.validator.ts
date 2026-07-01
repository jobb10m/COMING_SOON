import { z } from 'zod';

export const createPlanSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    duration: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'SIX_MONTHS', 'ANNUAL', 'CUSTOM']),
    durationDays: z.number().int().positive(),
    price: z.number().nonnegative(),
  }),
});

export const assignMembershipSchema = z.object({
  body: z.object({
    memberId: z.string().uuid(),
    planId: z.string().uuid(),
    startDate: z.string().datetime().optional(),
  }),
});
