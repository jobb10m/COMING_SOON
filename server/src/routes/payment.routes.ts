import { Router } from 'express';
import * as ctrl from '../controllers/payment.controller';
import { validate } from '../middleware/validate';
import { authenticate, authorize } from '../middleware/auth';
import { createPaymentSchema } from '../validators/payment.validator';

const router = Router();
const STAFF = ['ADMIN', 'RECEPTIONIST'] as const;

router.use(authenticate);

router.post('/', authorize(...STAFF), validate(createPaymentSchema), ctrl.createPayment);
router.get('/', authorize(...STAFF), ctrl.listPayments);
router.get('/reports/revenue', authorize('ADMIN', 'RECEPTIONIST'), ctrl.revenueReport);
router.get('/:id', ctrl.getPayment);
router.post('/:id/complete', authorize(...STAFF), ctrl.markCompleted);

export default router;
