import { z } from 'zod';

export const createMemberSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8),
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    phone: z.string().optional(),
    dateOfBirth: z.string().datetime().optional(),
    gender: z.string().optional(),
    address: z.string().optional(),
    emergencyContact: z.string().optional(),
    emergencyPhone: z.string().optional(),
    medicalConditions: z.string().optional(),
    trainerId: z.string().uuid().optional(),
  }),
});

export const updateMemberSchema = z.object({
  body: z.object({
    firstName: z.string().min(1).optional(),
    lastName: z.string().min(1).optional(),
    phone: z.string().optional(),
    dateOfBirth: z.string().datetime().optional(),
    gender: z.string().optional(),
    address: z.string().optional(),
    emergencyContact: z.string().optional(),
    emergencyPhone: z.string().optional(),
    medicalConditions: z.string().optional(),
    trainerId: z.string().uuid().nullable().optional(),
  }),
});

export const listMembersSchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    search: z.string().optional(),
    status: z.enum(['active', 'suspended', 'all']).optional(),
    trainerId: z.string().uuid().optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  }),
});
