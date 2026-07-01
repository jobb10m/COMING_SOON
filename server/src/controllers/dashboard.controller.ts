import { Response } from 'express';
import { prisma } from '../config/db';
import { asyncHandler } from '../utils/apiError';

export const getStats = asyncHandler(async (req, res: Response) => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const [
    totalMembers,
    activeMembers,
    newMembersThisMonth,
    trainersCount,
    attendanceToday,
    expiringMemberships,
    monthlyRevenueAgg,
    recentPayments,
    upcomingClasses,
  ] = await Promise.all([
    prisma.member.count({ where: { deletedAt: null } }),
    prisma.member.count({ where: { deletedAt: null, isSuspended: false } }),
    prisma.member.count({ where: { deletedAt: null, createdAt: { gte: startOfMonth } } }),
    prisma.trainer.count({ where: { deletedAt: null } }),
    prisma.attendance.count({ where: { date: { gte: startOfDay } } }),
    prisma.membership.count({
      where: { status: 'ACTIVE', endDate: { gte: now, lte: in7Days } },
    }),
    prisma.payment.aggregate({
      where: { status: 'COMPLETED', paidAt: { gte: startOfMonth } },
      _sum: { amount: true },
    }),
    prisma.payment.findMany({
      where: { status: 'COMPLETED' },
      orderBy: { paidAt: 'desc' },
      take: 5,
      include: { member: { select: { firstName: true, lastName: true } } },
    }),
    prisma.class.findMany({
      where: { startTime: { gte: now } },
      orderBy: { startTime: 'asc' },
      take: 5,
      include: { trainer: { select: { firstName: true, lastName: true } } },
    }),
  ]);

  res.json({
    success: true,
    data: {
      totalMembers,
      activeMembers,
      newMembersThisMonth,
      trainersCount,
      attendanceToday,
      expiringMemberships,
      monthlyRevenue: monthlyRevenueAgg._sum.amount || 0,
      recentPayments,
      upcomingClasses,
    },
  });
});

export const getRevenueChart = asyncHandler(async (req, res: Response) => {
  const months = 6;
  const now = new Date();
  const results: { month: string; revenue: number }[] = [];

  for (let i = months - 1; i >= 0; i--) {
    const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    const agg = await prisma.payment.aggregate({
      where: { status: 'COMPLETED', paidAt: { gte: start, lt: end } },
      _sum: { amount: true },
    });
    results.push({
      month: start.toLocaleString('default', { month: 'short', year: '2-digit' }),
      revenue: Number(agg._sum.amount || 0),
    });
  }

  res.json({ success: true, data: results });
});

export const getMembershipGrowth = asyncHandler(async (req, res: Response) => {
  const months = 6;
  const now = new Date();
  const results: { month: string; newMembers: number }[] = [];

  for (let i = months - 1; i >= 0; i--) {
    const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    const count = await prisma.member.count({
      where: { createdAt: { gte: start, lt: end }, deletedAt: null },
    });
    results.push({
      month: start.toLocaleString('default', { month: 'short', year: '2-digit' }),
      newMembers: count,
    });
  }

  res.json({ success: true, data: results });
});

export const getPopularPlans = asyncHandler(async (req, res: Response) => {
  const plans = await prisma.membershipPlan.findMany({
    where: { deletedAt: null },
    include: { _count: { select: { memberships: true } } },
  });

  const data = plans
    .map((p) => ({ name: p.name, count: p._count.memberships }))
    .sort((a, b) => b.count - a.count);

  res.json({ success: true, data });
});
