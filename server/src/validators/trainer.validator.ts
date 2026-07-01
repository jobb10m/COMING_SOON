import { z } from 'zod';

export const createTrainerSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8),
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    phone: z.string().optional(),
    salary: z.number().nonnegative().optional(),
    experienceYears: z.number().int().nonnegative().optional(),
    certifications: z.string().optional(),
    availability: z.string().optional(),
  }),
});
