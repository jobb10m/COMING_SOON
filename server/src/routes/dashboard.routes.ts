import { Router } from 'express';
import * as ctrl from '../controllers/dashboard.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate, authorize('ADMIN', 'RECEPTIONIST'));

router.get('/stats', ctrl.getStats);
router.get('/charts/revenue', ctrl.getRevenueChart);
router.get('/charts/membership-growth', ctrl.getMembershipGrowth);
router.get('/charts/popular-plans', ctrl.getPopularPlans);

export default router;
