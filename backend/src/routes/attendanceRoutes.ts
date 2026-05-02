import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import {
  checkIn,
  checkOut,
  getAttendanceStatus,
  getAttendanceHistory
} from '../controllers/attendanceController';

const router = Router();

router.post('/checkin', authenticate, authorize('employee'), checkIn);
router.post('/checkout', authenticate, authorize('employee'), checkOut);
router.get('/status', authenticate, authorize('employee'), getAttendanceStatus);
router.get('/history', authenticate, getAttendanceHistory);

export default router;
