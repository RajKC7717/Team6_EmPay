import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import {
  getIncomeTaxCalculation,
  submitTaxDeclaration,
  getTaxDeclarations,
  approveTaxDeclaration,
  rejectTaxDeclaration
} from '../controllers/taxController';

const router = Router();

router.get('/calculate', authenticate, authorize('employee', 'admin', 'hr_officer', 'payroll_officer'), getIncomeTaxCalculation);
router.post('/declarations', authenticate, authorize('employee'), submitTaxDeclaration);
router.get('/declarations', authenticate, getTaxDeclarations);
router.put('/declarations/:id/approve', authenticate, authorize('admin', 'hr_officer', 'payroll_officer'), approveTaxDeclaration);
router.put('/declarations/:id/reject', authenticate, authorize('admin', 'hr_officer', 'payroll_officer'), rejectTaxDeclaration);

export default router;
