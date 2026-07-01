import { Router } from 'express';
import * as ctrl from '../controllers/trainer.controller';
import { validate } from '../middleware/validate';
import { authenticate, authorize } from '../middleware/auth';
import { createTrainerSchema } from '../validators/trainer.validator';

const router = Router();

router.use(authenticate);

router.get('/me/members', authorize('TRAINER'), ctrl.getMyMembers);

router.post('/', authorize('ADMIN'), validate(createTrainerSchema), ctrl.createTrainer);
router.get('/', authorize('ADMIN', 'RECEPTIONIST'), ctrl.listTrainers);
router.get('/:id', authorize('ADMIN', 'RECEPTIONIST'), ctrl.getTrainer);
router.patch('/:id', authorize('ADMIN'), ctrl.updateTrainer);
router.delete('/:id', authorize('ADMIN'), ctrl.deleteTrainer);

export default router;
