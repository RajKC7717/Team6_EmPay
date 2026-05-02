import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import {
  createLeaveRequest,
  getLeaveRequests,
  approveLeaveRequest,
  rejectLeaveRequest,
  cancelLeaveRequest,
  getLeaveBalance,
  allocateLeave
} from '../controllers/leaveController';

const router = Router();

router.post('/requests', authenticate, authorize('employee', 'admin', 'hr_officer', 'payroll_officer'), createLeaveRequest);
router.get('/requests', authenticate, getLeaveRequests);
router.put('/requests/:id/approve', authenticate, authorize('admin', 'hr_officer'), approveLeaveRequest);
router.put('/requests/:id/reject', authenticate, authorize('admin', 'hr_officer'), rejectLeaveRequest);
router.put('/requests/:id/cancel', authenticate, authorize('employee'), cancelLeaveRequest);
router.get('/balance', authenticate, authorize('employee', 'admin', 'hr_officer', 'payroll_officer'), getLeaveBalance);
router.post('/allocate', authenticate, authorize('admin', 'hr_officer'), allocateLeave);

export default router;
