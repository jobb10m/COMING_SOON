import { Router } from 'express';
import * as ctrl from '../controllers/attendance.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();
const STAFF = ['ADMIN', 'RECEPTIONIST'] as const;

router.use(authenticate);

router.post('/check-in', authorize(...STAFF), ctrl.checkIn);
router.post('/check-out', authorize(...STAFF), ctrl.checkOut);
router.post('/manual', authorize(...STAFF, 'TRAINER'), ctrl.manualAttendance);
router.get('/', authorize(...STAFF, 'TRAINER'), ctrl.listAttendance);
router.get('/calendar', ctrl.attendanceCalendar);

export default router;
