import { Response } from 'express';
import crypto from 'crypto';
import { prisma } from '../config/db';
import { asyncHandler, ApiError } from '../utils/apiError';
import { hashPassword, comparePassword } from '../utils/password';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { AuthRequest } from '../middleware/auth';
import { Role } from '@prisma/client';

export const register = asyncHandler(async (req, res: Response) => {
  const { email, password, firstName, lastName, phone, role } = req.body;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw ApiError.conflict('An account with this email already exists');

  const hashed = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashed,
      role: role as Role,
      ...(role === 'MEMBER' && {
        member: { create: { firstName, lastName, phone } },
      }),
      ...(role === 'TRAINER' && {
        trainer: { create: { firstName, lastName, phone } },
      }),
    },
  });

  const accessToken = signAccessToken({ userId: user.id, role: user.role });
  const refreshToken = signRefreshToken({ userId: user.id, role: user.role });

  await prisma.user.update({ where: { id: user.id }, data: { refreshToken } });

  res.status(201).json({
    success: true,
    data: { user: { id: user.id, email: user.email, role: user.role }, accessToken, refreshToken },
  });
});

export const login = asyncHandler(async (req, res: Response) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({
    where: { email },
    include: { member: true, trainer: true },
  });
  if (!user || !user.isActive) throw ApiError.unauthorized('Invalid email or password');

  const valid = await comparePassword(password, user.password);
  if (!valid) throw ApiError.unauthorized('Invalid email or password');

  const accessToken = signAccessToken({ userId: user.id, role: user.role });
  const refreshToken = signRefreshToken({ userId: user.id, role: user.role });

  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken, lastLoginAt: new Date() },
  });

  res.json({
    success: true,
    data: {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        profile: user.member || user.trainer || null,
      },
      accessToken,
      refreshToken,
    },
  });
});

export const refresh = asyncHandler(async (req, res: Response) => {
  const { refreshToken } = req.body;

  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw ApiError.unauthorized('Invalid or expired refresh token');
  }

  const user = await prisma.user.findUnique({ where: { id: payload.userId } });
  if (!user || user.refreshToken !== refreshToken) {
    throw ApiError.unauthorized('Refresh token has been revoked');
  }

  const newAccessToken = signAccessToken({ userId: user.id, role: user.role });
  const newRefreshToken = signRefreshToken({ userId: user.id, role: user.role });

  await prisma.user.update({ where: { id: user.id }, data: { refreshToken: newRefreshToken } });

  res.json({ success: true, data: { accessToken: newAccessToken, refreshToken: newRefreshToken } });
});

export const logout = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (req.user) {
    await prisma.user.update({ where: { id: req.user.userId }, data: { refreshToken: null } });
  }
  res.json({ success: true, message: 'Logged out successfully' });
});

export const forgotPassword = asyncHandler(async (req, res: Response) => {
  const { email } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });

  // Always respond success to avoid leaking which emails are registered
  if (!user) {
    return res.json({ success: true, message: 'If that email exists, a reset link has been sent' });
  }

  const token = crypto.randomBytes(32).toString('hex');
  const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await prisma.user.update({
    where: { id: user.id },
    data: { resetToken: token, resetTokenExpiry: expiry },
  });

  // TODO: send email via nodemailer (see src/utils/mailer.ts) with a link containing `token`
  res.json({
    success: true,
    message: 'If that email exists, a reset link has been sent',
    // devToken only returned in non-production for local testing
    ...(process.env.NODE_ENV !== 'production' && { devToken: token }),
  });
});

export const resetPassword = asyncHandler(async (req, res: Response) => {
  const { token, newPassword } = req.body;

  const user = await prisma.user.findFirst({
    where: { resetToken: token, resetTokenExpiry: { gt: new Date() } },
  });
  if (!user) throw ApiError.badRequest('Invalid or expired reset token');

  const hashed = await hashPassword(newPassword);
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashed, resetToken: null, resetTokenExpiry: null, refreshToken: null },
  });

  res.json({ success: true, message: 'Password has been reset successfully' });
});

export const changePassword = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  if (!req.user) throw ApiError.unauthorized();

  const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
  if (!user) throw ApiError.notFound('User not found');

  const valid = await comparePassword(currentPassword, user.password);
  if (!valid) throw ApiError.badRequest('Current password is incorrect');

  const hashed = await hashPassword(newPassword);
  await prisma.user.update({ where: { id: user.id }, data: { password: hashed } });

  res.json({ success: true, message: 'Password changed successfully' });
});

export const getMe = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const user = await prisma.user.findUnique({
    where: { id: req.user.userId },
    include: { member: true, trainer: true },
  });
  if (!user) throw ApiError.notFound('User not found');

  res.json({
    success: true,
    data: {
      id: user.id,
      email: user.email,
      role: user.role,
      profile: user.member || user.trainer || null,
    },
  });
});
