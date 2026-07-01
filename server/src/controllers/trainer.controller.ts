import { Response } from 'express';
import { prisma } from '../config/db';
import { asyncHandler, ApiError } from '../utils/apiError';
import { hashPassword } from '../utils/password';
import { AuthRequest } from '../middleware/auth';

export const createTrainer = asyncHandler(async (req, res: Response) => {
  const { email, password, firstName, lastName, phone, salary, experienceYears, certifications, availability } = req.body;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw ApiError.conflict('An account with this email already exists');

  const hashed = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashed,
      role: 'TRAINER',
      trainer: {
        create: { firstName, lastName, phone, salary, experienceYears, certifications, availability },
      },
    },
    include: { trainer: true },
  });

  res.status(201).json({ success: true, data: user.trainer });
});

export const listTrainers = asyncHandler(async (req, res: Response) => {
  const page = parseInt((req.query.page as string) || '1', 10);
  const limit = parseInt((req.query.limit as string) || '10', 10);
  const search = (req.query.search as string) || '';

  const where = {
    deletedAt: null,
    ...(search && {
      OR: [
        { firstName: { contains: search, mode: 'insensitive' as const } },
        { lastName: { contains: search, mode: 'insensitive' as const } },
      ],
    }),
  };

  const [trainers, total] = await Promise.all([
    prisma.trainer.findMany({
      where,
      include: {
        user: { select: { email: true } },
        _count: { select: { assignedMembers: true } },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.trainer.count({ where }),
  ]);

  res.json({ success: true, data: trainers, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
});

export const getTrainer = asyncHandler(async (req, res: Response) => {
  const trainer = await prisma.trainer.findFirst({
    where: { id: req.params.id, deletedAt: null },
    include: {
      user: { select: { email: true } },
      assignedMembers: { select: { id: true, firstName: true, lastName: true } },
      workoutPrograms: true,
      classes: true,
    },
  });
  if (!trainer) throw ApiError.notFound('Trainer not found');
  res.json({ success: true, data: trainer });
});

export const updateTrainer = asyncHandler(async (req, res: Response) => {
  const trainer = await prisma.trainer.update({ where: { id: req.params.id }, data: req.body });
  res.json({ success: true, data: trainer });
});

export const deleteTrainer = asyncHandler(async (req, res: Response) => {
  await prisma.trainer.update({ where: { id: req.params.id }, data: { deletedAt: new Date() } });
  res.json({ success: true, message: 'Trainer deleted' });
});

// Trainer viewing their own assigned members
export const getMyMembers = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const trainer = await prisma.trainer.findUnique({ where: { userId: req.user.userId } });
  if (!trainer) throw ApiError.notFound('Trainer profile not found');

  const members = await prisma.member.findMany({
    where: { trainerId: trainer.id, deletedAt: null },
    include: { memberships: { where: { status: 'ACTIVE' }, include: { plan: true } } },
  });

  res.json({ success: true, data: members });
});
