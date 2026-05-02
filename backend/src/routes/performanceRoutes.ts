import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import {
  createPerformanceReview,
  getPerformanceReviews,
  updatePerformanceReview,
  deletePerformanceReview,
  createGoal,
  getGoals,
  updateGoal,
  deleteGoal
} from '../controllers/performanceController';

const router = Router();

router.post('/reviews', authenticate, authorize('admin', 'hr_officer'), createPerformanceReview);
router.get('/reviews', authenticate, getPerformanceReviews);
router.put('/reviews/:id', authenticate, authorize('admin', 'hr_officer'), updatePerformanceReview);
router.delete('/reviews/:id', authenticate, authorize('admin', 'hr_officer'), deletePerformanceReview);

router.post('/goals', authenticate, authorize('admin', 'hr_officer'), createGoal);
router.get('/goals', authenticate, getGoals);
router.put('/goals/:id', authenticate, updateGoal);
router.delete('/goals/:id', authenticate, authorize('admin', 'hr_officer'), deleteGoal);

export default router;
