import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';

import authRoutes from './routes/auth.routes';
import memberRoutes from './routes/member.routes';
import trainerRoutes from './routes/trainer.routes';
import membershipRoutes from './routes/membershipPlan.routes';
import attendanceRoutes from './routes/attendance.routes';
import paymentRoutes from './routes/payment.routes';
import dashboardRoutes from './routes/dashboard.routes';

import { notFoundHandler, errorHandler } from './middleware/error';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || '*', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use('/uploads', express.static(path.join(process.cwd(), process.env.UPLOAD_DIR || 'uploads')));

app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'Gym Management API is running', timestamp: new Date().toISOString() });
});

// --- API routes ---
app.use('/api/auth', authRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/trainers', trainerRoutes);
app.use('/api/memberships', membershipRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/dashboard', dashboardRoutes);

// TODO: wire up the remaining modules following the same
// controller/route/validator pattern used above:
//   - workout.routes.ts        (WorkoutProgram, Exercise, WorkoutAssignment)
//   - dietPlan.routes.ts       (DietPlan)
//   - progress.routes.ts       (ProgressRecord)
//   - equipment.routes.ts      (Equipment, Maintenance)
//   - class.routes.ts          (Class, ClassBooking)
//   - notification.routes.ts   (Notification)
//   - settings.routes.ts       (Settings — gym info, taxes, currency, logo)
//   - reports.routes.ts        (PDF/Excel/CSV export of reports)
// All underlying Prisma models already exist in prisma/schema.prisma.

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Gym Management API listening on http://localhost:${PORT}`);
});

export default app;
