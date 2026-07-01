import { Response } from 'express';
import { prisma } from '../config/db';
import { asyncHandler, ApiError } from '../utils/apiError';

// QR check-in: memberId comes from decoding the member's qrCode
export const checkIn = asyncHandler(async (req, res: Response) => {
  const { qrCode, memberId, method } = req.body;

  const member = qrCode
    ? await prisma.member.findUnique({ where: { qrCode } })
    : await prisma.member.findUnique({ where: { id: memberId } });

  if (!member) throw ApiError.notFound('Member not found for this QR code');
  if (member.isSuspended) throw ApiError.forbidden('Member is suspended');

  const attendance = await prisma.attendance.create({
    data: {
      memberId: member.id,
      checkIn: new Date(),
      method: method || 'QR_CHECK_IN',
    },
  });

  res.status(201).json({ success: true, data: attendance });
});

export const checkOut = asyncHandler(async (req, res: Response) => {
  const { attendanceId } = req.body;

  const record = await prisma.attendance.update({
    where: { id: attendanceId },
    data: { checkOut: new Date() },
  });

  res.json({ success: true, data: record });
});

export const manualAttendance = asyncHandler(async (req, res: Response) => {
  const { memberId, date, checkIn, checkOut } = req.body;

  const attendance = await prisma.attendance.create({
    data: {
      memberId,
      date: date ? new Date(date) : new Date(),
      checkIn: checkIn ? new Date(checkIn) : new Date(),
      checkOut: checkOut ? new Date(checkOut) : null,
      method: 'MANUAL',
    },
  });

  res.status(201).json({ success: true, data: attendance });
});

export const listAttendance = asyncHandler(async (req, res: Response) => {
  const { memberId, from, to, page = '1', limit = '20' } = req.query as Record<string, string>;

  const where: Record<string, unknown> = {};
  if (memberId) where.memberId = memberId;
  if (from || to) {
    where.date = {
      ...(from && { gte: new Date(from) }),
      ...(to && { lte: new Date(to) }),
    };
  }

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);

  const [records, total] = await Promise.all([
    prisma.attendance.findMany({
      where,
      include: { member: { select: { firstName: true, lastName: true } } },
      orderBy: { date: 'desc' },
      skip: (pageNum - 1) * limitNum,
      take: limitNum,
    }),
    prisma.attendance.count({ where }),
  ]);

  res.json({
    success: true,
    data: records,
    pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
  });
});

// Calendar view: attendance count grouped by day for a given member/month
export const attendanceCalendar = asyncHandler(async (req, res: Response) => {
  const { memberId, month, year } = req.query as Record<string, string>;
  const y = parseInt(year, 10) || new Date().getFullYear();
  const m = parseInt(month, 10) || new Date().getMonth() + 1;

  const start = new Date(y, m - 1, 1);
  const end = new Date(y, m, 1);

  const records = await prisma.attendance.findMany({
    where: { memberId, date: { gte: start, lt: end } },
    select: { date: true, checkIn: true, checkOut: true },
    orderBy: { date: 'asc' },
  });

  res.json({ success: true, data: records });
});
