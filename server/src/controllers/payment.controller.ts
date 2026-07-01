import { Response } from 'express';
import { prisma } from '../config/db';
import { asyncHandler, ApiError } from '../utils/apiError';

function generateInvoiceNumber(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `INV-${ts}-${rand}`;
}

export const createPayment = asyncHandler(async (req, res: Response) => {
  const { memberId, membershipId, amount, method, status, reference } = req.body;

  const payment = await prisma.payment.create({
    data: {
      memberId,
      membershipId,
      amount,
      method,
      status: status || 'PENDING',
      reference,
      paidAt: status === 'COMPLETED' ? new Date() : null,
    },
  });

  // Auto-generate an invoice when payment is completed
  if (payment.status === 'COMPLETED') {
    const settings = await prisma.settings.findFirst();
    const taxPercent = settings ? Number(settings.taxPercent) : 0;
    const taxAmount = (Number(amount) * taxPercent) / 100;

    await prisma.invoice.create({
      data: {
        paymentId: payment.id,
        memberId,
        invoiceNumber: generateInvoiceNumber(),
        taxAmount,
        totalAmount: Number(amount) + taxAmount,
      },
    });
  }

  const withInvoice = await prisma.payment.findUnique({
    where: { id: payment.id },
    include: { invoice: true },
  });

  res.status(201).json({ success: true, data: withInvoice });
});

export const listPayments = asyncHandler(async (req, res: Response) => {
  const { memberId, status, page = '1', limit = '20' } = req.query as Record<string, string>;

  const where: Record<string, unknown> = {};
  if (memberId) where.memberId = memberId;
  if (status) where.status = status;

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);

  const [payments, total] = await Promise.all([
    prisma.payment.findMany({
      where,
      include: {
        member: { select: { firstName: true, lastName: true } },
        invoice: true,
      },
      orderBy: { createdAt: 'desc' },
      skip: (pageNum - 1) * limitNum,
      take: limitNum,
    }),
    prisma.payment.count({ where }),
  ]);

  res.json({
    success: true,
    data: payments,
    pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
  });
});

export const getPayment = asyncHandler(async (req, res: Response) => {
  const payment = await prisma.payment.findUnique({
    where: { id: req.params.id },
    include: { member: true, membership: { include: { plan: true } }, invoice: true },
  });
  if (!payment) throw ApiError.notFound('Payment not found');
  res.json({ success: true, data: payment });
});

export const markCompleted = asyncHandler(async (req, res: Response) => {
  const payment = await prisma.payment.update({
    where: { id: req.params.id },
    data: { status: 'COMPLETED', paidAt: new Date() },
  });

  const existingInvoice = await prisma.invoice.findUnique({ where: { paymentId: payment.id } });
  if (!existingInvoice) {
    const settings = await prisma.settings.findFirst();
    const taxPercent = settings ? Number(settings.taxPercent) : 0;
    const taxAmount = (Number(payment.amount) * taxPercent) / 100;

    await prisma.invoice.create({
      data: {
        paymentId: payment.id,
        memberId: payment.memberId,
        invoiceNumber: generateInvoiceNumber(),
        taxAmount,
        totalAmount: Number(payment.amount) + taxAmount,
      },
    });
  }

  res.json({ success: true, data: payment });
});

export const revenueReport = asyncHandler(async (req, res: Response) => {
  const { from, to } = req.query as Record<string, string>;

  const where: Record<string, unknown> = { status: 'COMPLETED' };
  if (from || to) {
    where.paidAt = {
      ...(from && { gte: new Date(from) }),
      ...(to && { lte: new Date(to) }),
    };
  }

  const payments = await prisma.payment.findMany({ where });
  const totalRevenue = payments.reduce((sum, p) => sum + Number(p.amount), 0);

  res.json({
    success: true,
    data: { totalRevenue, transactionCount: payments.length },
  });
});
