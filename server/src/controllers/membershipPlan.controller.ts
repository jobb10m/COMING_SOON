import { Response } from 'express';
import { prisma } from '../config/db';
import { asyncHandler, ApiError } from '../utils/apiError';

// --- Plans (catalog) ---

export const createPlan = asyncHandler(async (req, res: Response) => {
  const plan = await prisma.membershipPlan.create({ data: req.body });
  res.status(201).json({ success: true, data: plan });
});

export const listPlans = asyncHandler(async (req, res: Response) => {
  const plans = await prisma.membershipPlan.findMany({
    where: { deletedAt: null },
    orderBy: { price: 'asc' },
  });
  res.json({ success: true, data: plans });
});

export const updatePlan = asyncHandler(async (req, res: Response) => {
  const plan = await prisma.membershipPlan.update({ where: { id: req.params.id }, data: req.body });
  res.json({ success: true, data: plan });
});

export const deletePlan = asyncHandler(async (req, res: Response) => {
  await prisma.membershipPlan.update({ where: { id: req.params.id }, data: { deletedAt: new Date() } });
  res.json({ success: true, message: 'Plan deleted' });
});

// --- Memberships (assigned to a member) ---

export const assignMembership = asyncHandler(async (req, res: Response) => {
  const { memberId, planId, startDate } = req.body;

  const plan = await prisma.membershipPlan.findUnique({ where: { id: planId } });
  if (!plan) throw ApiError.notFound('Membership plan not found');

  const start = startDate ? new Date(startDate) : new Date();
  const end = new Date(start.getTime() + plan.durationDays * 24 * 60 * 60 * 1000);

  const membership = await prisma.membership.create({
    data: { memberId, planId, startDate: start, endDate: end, status: 'ACTIVE' },
    include: { plan: true },
  });

  res.status(201).json({ success: true, data: membership });
});

export const renewMembership = asyncHandler(async (req, res: Response) => {
  const membership = await prisma.membership.findUnique({
    where: { id: req.params.id },
    include: { plan: true },
  });
  if (!membership) throw ApiError.notFound('Membership not found');

  const base = membership.endDate > new Date() ? membership.endDate : new Date();
  const newEnd = new Date(base.getTime() + membership.plan.durationDays * 24 * 60 * 60 * 1000);

  const updated = await prisma.membership.update({
    where: { id: req.params.id },
    data: { endDate: newEnd, status: 'ACTIVE' },
  });

  res.json({ success: true, data: updated });
});

export const freezeMembership = asyncHandler(async (req, res: Response) => {
  const { freezeStart, freezeEnd } = req.body;
  const updated = await prisma.membership.update({
    where: { id: req.params.id },
    data: {
      status: 'FROZEN',
      isFrozen: true,
      freezeStart: freezeStart ? new Date(freezeStart) : new Date(),
      freezeEnd: freezeEnd ? new Date(freezeEnd) : null,
    },
  });
  res.json({ success: true, data: updated });
});

export const changePlan = asyncHandler(async (req, res: Response) => {
  const { newPlanId } = req.body;
  const plan = await prisma.membershipPlan.findUnique({ where: { id: newPlanId } });
  if (!plan) throw ApiError.notFound('Membership plan not found');

  const updated = await prisma.membership.update({
    where: { id: req.params.id },
    data: { planId: newPlanId },
  });

  res.json({ success: true, data: updated, message: 'Plan updated (upgrade/downgrade)' });
});

// Utility endpoint: mark expired memberships (could also be run via a cron job)
export const runExpiryCheck = asyncHandler(async (req, res: Response) => {
  const result = await prisma.membership.updateMany({
    where: { status: 'ACTIVE', endDate: { lt: new Date() } },
    data: { status: 'EXPIRED' },
  });
  res.json({ success: true, message: `${result.count} membership(s) marked expired` });
});
