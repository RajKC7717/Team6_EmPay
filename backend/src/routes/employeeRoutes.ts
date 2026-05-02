import { Router } from 'express';
import multer from 'multer';
import { authenticate, authorize } from '../middleware/auth';
import {
  createEmployee,
  uploadResume,
  getEmployees,
  getEmployeeById,
  updateEmployee,
  deactivateEmployee
} from '../controllers/employeeController';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// ✅ FIXED HERE
router.post('/', authenticate, authorize('admin', 'hr_officer'), createEmployee);

router.post(
  '/upload-resume',
  authenticate,
  authorize('admin', 'hr_officer'),
  upload.single('resume'),
  uploadResume
);

router.get('/', authenticate, getEmployees);

router.get('/:id', authenticate, getEmployeeById);

router.put('/:id', authenticate, updateEmployee);

// ✅ FIXED HERE
router.delete('/:id', authenticate, authorize('admin', 'hr_officer'), deactivateEmployee);

export default router;
