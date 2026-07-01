import { Router } from 'express';
import * as ctrl from '../controllers/membershipPlan.controller';
import { validate } from '../middleware/validate';
import { authenticate, authorize } from '../middleware/auth';
import { createPlanSchema, assignMembershipSchema } from '../validators/membershipPlan.validator';

const router = Router();
const STAFF = ['ADMIN', 'RECEPTIONIST'] as const;

router.use(authenticate);

// Plan catalog
router.post('/plans', authorize('ADMIN'), validate(createPlanSchema), ctrl.createPlan);
router.get('/plans', ctrl.listPlans);
router.patch('/plans/:id', authorize('ADMIN'), ctrl.updatePlan);
router.delete('/plans/:id', authorize('ADMIN'), ctrl.deletePlan);

// Member memberships
router.post('/', authorize(...STAFF), validate(assignMembershipSchema), ctrl.assignMembership);
router.post('/:id/renew', authorize(...STAFF), ctrl.renewMembership);
router.post('/:id/freeze', authorize(...STAFF), ctrl.freezeMembership);
router.post('/:id/change-plan', authorize(...STAFF), ctrl.changePlan);
router.post('/run-expiry-check', authorize('ADMIN'), ctrl.runExpiryCheck);

export default router;
