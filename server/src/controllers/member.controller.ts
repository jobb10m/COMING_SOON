import { Response } from 'express';
import { randomUUID } from 'crypto';
import { prisma } from '../config/db';
import { asyncHandler, ApiError } from '../utils/apiError';
import { hashPassword } from '../utils/password';
import { AuthRequest } from '../middleware/auth';
import { Prisma } from '@prisma/client';

export const createMember = asyncHandler(async (req, res: Response) => {
  const { email, password, firstName, lastName, phone, dateOfBirth, gender, address,
    emergencyContact, emergencyPhone, medicalConditions, trainerId } = req.body;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw ApiError.conflict('An account with this email already exists');

  const hashed = await hashPassword(password);
  const qrCode = randomUUID();

  const user = await prisma.user.create({
    data: {
      email,
      password: hashed,
      role: 'MEMBER',
      member: {
        create: {
          firstName,
          lastName,
          phone,
          qrCode,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
          gender,
          address,
          emergencyContact,
          emergencyPhone,
          medicalConditions,
          trainerId,
        },
      },
    },
    include: { member: true },
  });

  res.status(201).json({ success: true, data: user.member });
});

export const listMembers = asyncHandler(async (req, res: Response) => {
  const page = parseInt((req.query.page as string) || '1', 10);
  const limit = parseInt((req.query.limit as string) || '10', 10);
  const search = (req.query.search as string) || '';
  const status = (req.query.status as string) || 'all';
  const trainerId = req.query.trainerId as string | undefined;
  const sortBy = (req.query.sortBy as string) || 'createdAt';
  const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'desc';

  const where: Prisma.MemberWhereInput = {
    deletedAt: null,
    ...(status === 'active' && { isSuspended: false }),
    ...(status === 'suspended' && { isSuspended: true }),
    ...(trainerId && { trainerId }),
    ...(search && {
      OR: [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
      ],
    }),
  };

  const [members, total] = await Promise.all([
    prisma.member.findMany({
      where,
      include: {
        user: { select: { email: true, isActive: true } },
        assignedTrainer: { select: { firstName: true, lastName: true } },
        memberships: {
          where: { status: 'ACTIVE' },
          orderBy: { endDate: 'desc' },
          take: 1,
          include: { plan: true },
        },
      },
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.member.count({ where }),
  ]);

  res.json({
    success: true,
    data: members,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});

export const getMember = asyncHandler(async (req, res: Response) => {
  const member = await prisma.member.findFirst({
    where: { id: req.params.id, deletedAt: null },
    include: {
      user: { select: { email: true, isActive: true, lastLoginAt: true } },
      assignedTrainer: true,
      memberships: { include: { plan: true }, orderBy: { createdAt: 'desc' } },
      progressRecords: { orderBy: { recordedAt: 'desc' }, take: 5 },
    },
  });
  if (!member) throw ApiError.notFound('Member not found');
  res.json({ success: true, data: member });
});

export const updateMember = asyncHandler(async (req, res: Response) => {
  const existing = await prisma.member.findFirst({ where: { id: req.params.id, deletedAt: null } });
  if (!existing) throw ApiError.notFound('Member not found');

  const { dateOfBirth, ...rest } = req.body;

  const updated = await prisma.member.update({
    where: { id: req.params.id },
    data: {
      ...rest,
      ...(dateOfBirth && { dateOfBirth: new Date(dateOfBirth) }),
    },
  });

  res.json({ success: true, data: updated });
});

export const deleteMember = asyncHandler(async (req, res: Response) => {
  const existing = await prisma.member.findFirst({ where: { id: req.params.id, deletedAt: null } });
  if (!existing) throw ApiError.notFound('Member not found');

  await prisma.member.update({ where: { id: req.params.id }, data: { deletedAt: new Date() } });
  res.json({ success: true, message: 'Member deleted successfully' });
});

export const suspendMember = asyncHandler(async (req, res: Response) => {
  const member = await prisma.member.update({
    where: { id: req.params.id },
    data: { isSuspended: true },
  });
  res.json({ success: true, data: member });
});

export const reactivateMember = asyncHandler(async (req, res: Response) => {
  const member = await prisma.member.update({
    where: { id: req.params.id },
    data: { isSuspended: false },
  });
  res.json({ success: true, data: member });
});

// Members viewing their own profile (role MEMBER)
export const getMyProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const member = await prisma.member.findUnique({
    where: { userId: req.user.userId },
    include: {
      memberships: { include: { plan: true }, orderBy: { createdAt: 'desc' } },
      assignedTrainer: true,
    },
  });
  if (!member) throw ApiError.notFound('Member profile not found');
  res.json({ success: true, data: member });
});
