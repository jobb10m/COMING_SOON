import { Router } from 'express';
import * as memberController from '../controllers/member.controller';
import { validate } from '../middleware/validate';
import { authenticate, authorize } from '../middleware/auth';
import { createMemberSchema, updateMemberSchema, listMembersSchema } from '../validators/member.validator';

const router = Router();
const STAFF = ['ADMIN', 'RECEPTIONIST'] as const;

router.use(authenticate);

router.get('/me/profile', authorize('MEMBER'), memberController.getMyProfile);

router.post('/', authorize(...STAFF), validate(createMemberSchema), memberController.createMember);
router.get('/', authorize(...STAFF, 'TRAINER'), validate(listMembersSchema), memberController.listMembers);
router.get('/:id', authorize(...STAFF, 'TRAINER'), memberController.getMember);
router.patch('/:id', authorize(...STAFF), validate(updateMemberSchema), memberController.updateMember);
router.delete('/:id', authorize('ADMIN'), memberController.deleteMember);
router.post('/:id/suspend', authorize(...STAFF), memberController.suspendMember);
router.post('/:id/reactivate', authorize(...STAFF), memberController.reactivateMember);

export default router;
