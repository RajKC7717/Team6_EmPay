import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import {
  createPolicy,
  getPolicies,
  getPolicyById,
  updatePolicy,
  deletePolicy,
  getPolicyCategories
} from '../controllers/policyController';

const router = Router();

router.post('/', authenticate, authorize('admin'), createPolicy);
router.get('/', authenticate, getPolicies);
router.get('/categories', authenticate, getPolicyCategories);
router.get('/:id', authenticate, getPolicyById);
router.put('/:id', authenticate, authorize('admin'), updatePolicy);
router.delete('/:id', authenticate, authorize('admin'), deletePolicy);

export default router;
