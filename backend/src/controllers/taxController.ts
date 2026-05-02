import { Request, Response } from 'express';
import pool from '../config/database';

interface TaxSlab {
  min: number;
  max: number | null;
  rate: number;
}

const TAX_SLABS_2026: TaxSlab[] = [
  { min: 0, max: 300000, rate: 0 },
  { min: 300001, max: 700000, rate: 0.05 },
  { min: 700001, max: 1000000, rate: 0.10 },
  { min: 1000001, max: 1200000, rate: 0.15 },
  { min: 1200001, max: 1500000, rate: 0.20 },
  { min: 1500001, max: null, rate: 0.30 }
];

const STANDARD_DEDUCTION = 50000;
const CESS_RATE = 0.04;

export const calculateIncomeTax = (annualIncome: number, deductions: number = 0): any => {
  const taxableIncome = Math.max(0, annualIncome - STANDARD_DEDUCTION - deductions);
  
  let tax = 0;
  let remainingIncome = taxableIncome;

  for (const slab of TAX_SLABS_2026) {
    if (remainingIncome <= 0) break;

    const slabMin = slab.min;
    const slabMax = slab.max || Infinity;
    const slabRange = slabMax - slabMin;
    
    const taxableInSlab = Math.min(remainingIncome, slabRange);
    const taxInSlab = taxableInSlab * slab.rate;
    
    tax += taxInSlab;
    remainingIncome -= taxableInSlab;
  }

  const cess = tax * CESS_RATE;
  const totalTax = tax + cess;

  return {
    annualIncome,
    standardDeduction: STANDARD_DEDUCTION,
    otherDeductions: deductions,
    taxableIncome,
    taxBeforeCess: Math.round(tax),
    cess: Math.round(cess),
    totalTax: Math.round(totalTax),
    monthlyTaxDeduction: Math.round(totalTax / 12),
    effectiveTaxRate: annualIncome > 0 ? ((totalTax / annualIncome) * 100).toFixed(2) : '0.00'
  };
};

export const getIncomeTaxCalculation = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const companyId = (req as any).user.company_id;

    const employeeResult = await pool.query(
      'SELECT id, basic_wage FROM employees WHERE user_id = $1 AND company_id = $2',
      [userId, companyId]
    );

    if (employeeResult.rows.length === 0) {
      return res.status(404).json({ error: 'Employee profile not found' });
    }

    const employee = employeeResult.rows[0];
    const annualIncome = employee.basic_wage * 12;

    const declarationsResult = await pool.query(
      `SELECT 
        COALESCE(SUM(CASE WHEN declaration_type = 'hra' THEN amount ELSE 0 END), 0) as hra,
        COALESCE(SUM(CASE WHEN declaration_type = 'section_80c' THEN amount ELSE 0 END), 0) as section_80c,
        COALESCE(SUM(CASE WHEN declaration_type = 'section_80d' THEN amount ELSE 0 END), 0) as section_80d,
        COALESCE(SUM(CASE WHEN declaration_type = 'home_loan' THEN amount ELSE 0 END), 0) as home_loan,
        COALESCE(SUM(CASE WHEN declaration_type = 'other' THEN amount ELSE 0 END), 0) as other
       FROM tax_declarations
       WHERE employee_id = $1 AND financial_year = $2 AND status = 'approved'`,
      [employee.id, '2026-27']
    );

    const declarations = declarationsResult.rows[0];
    const totalDeductions = 
      parseFloat(declarations.hra) +
      Math.min(parseFloat(declarations.section_80c), 150000) +
      Math.min(parseFloat(declarations.section_80d), 25000) +
      Math.min(parseFloat(declarations.home_loan), 200000) +
      parseFloat(declarations.other);

    const taxCalculation = calculateIncomeTax(annualIncome, totalDeductions);

    res.json({
      ...taxCalculation,
      declarations: {
        hra: parseFloat(declarations.hra),
        section80C: Math.min(parseFloat(declarations.section_80c), 150000),
        section80D: Math.min(parseFloat(declarations.section_80d), 25000),
        homeLoan: Math.min(parseFloat(declarations.home_loan), 200000),
        other: parseFloat(declarations.other)
      }
    });
  } catch (error) {
    console.error('Get income tax calculation error:', error);
    res.status(500).json({ error: 'Failed to calculate income tax' });
  }
};

export const submitTaxDeclaration = async (req: Request, res: Response) => {
  try {
    const { declarationType, amount, proofDocument, description } = req.body;
    const userId = (req as any).user.id;
    const companyId = (req as any).user.company_id;

    const employeeResult = await pool.query(
      'SELECT id FROM employees WHERE user_id = $1 AND company_id = $2',
      [userId, companyId]
    );

    if (employeeResult.rows.length === 0) {
      return res.status(404).json({ error: 'Employee profile not found' });
    }

    const employeeId = employeeResult.rows[0].id;
    const financialYear = '2026-27';

    const result = await pool.query(
      `INSERT INTO tax_declarations (employee_id, financial_year, declaration_type, amount, proof_document, description, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [employeeId, financialYear, declarationType, amount, proofDocument, description, 'pending']
    );

    res.status(201).json({
      message: 'Tax declaration submitted successfully',
      declaration: result.rows[0]
    });
  } catch (error) {
    console.error('Submit tax declaration error:', error);
    res.status(500).json({ error: 'Failed to submit tax declaration' });
  }
};

export const getTaxDeclarations = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const userRole = (req as any).user.role;
    const companyId = (req as any).user.company_id;

    const { employeeId, status, financialYear } = req.query;

    let query = `
      SELECT td.*, e.first_name, e.last_name, e.department
      FROM tax_declarations td
      JOIN employees e ON td.employee_id = e.id
      WHERE e.company_id = $1
    `;
    const params: any[] = [companyId];
    let paramIndex = 2;

    if (userRole === 'employee') {
      const employeeResult = await pool.query(
        'SELECT id FROM employees WHERE user_id = $1',
        [userId]
      );
      if (employeeResult.rows.length > 0) {
        query += ` AND td.employee_id = $${paramIndex}`;
        params.push(employeeResult.rows[0].id);
        paramIndex++;
      }
    }

    if (employeeId && (userRole === 'admin' || userRole === 'hr_officer' || userRole === 'payroll_officer')) {
      query += ` AND td.employee_id = $${paramIndex}`;
      params.push(employeeId);
      paramIndex++;
    }

    if (status) {
      query += ` AND td.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (financialYear) {
      query += ` AND td.financial_year = $${paramIndex}`;
      params.push(financialYear);
      paramIndex++;
    }

    query += ' ORDER BY td.created_at DESC';

    const result = await pool.query(query, params);

    res.json({ declarations: result.rows });
  } catch (error) {
    console.error('Get tax declarations error:', error);
    res.status(500).json({ error: 'Failed to fetch tax declarations' });
  }
};

export const approveTaxDeclaration = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;
    const userRole = (req as any).user.role;
    const companyId = (req as any).user.company_id;

    if (userRole !== 'admin' && userRole !== 'hr_officer' && userRole !== 'payroll_officer') {
      return res.status(403).json({ error: 'Only Admin, HR, or Payroll Officer can approve declarations' });
    }

    const declarationCheck = await pool.query(
      `SELECT td.id FROM tax_declarations td
       JOIN employees e ON td.employee_id = e.id
       WHERE td.id = $1 AND e.company_id = $2`,
      [id, companyId]
    );

    if (declarationCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Tax declaration not found' });
    }

    await pool.query(
      'UPDATE tax_declarations SET status = $1, approved_by = $2, updated_at = NOW() WHERE id = $3',
      ['approved', userId, id]
    );

    res.json({ message: 'Tax declaration approved successfully' });
  } catch (error) {
    console.error('Approve tax declaration error:', error);
    res.status(500).json({ error: 'Failed to approve tax declaration' });
  }
};

export const rejectTaxDeclaration = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;
    const userId = (req as any).user.id;
    const userRole = (req as any).user.role;
    const companyId = (req as any).user.company_id;

    if (userRole !== 'admin' && userRole !== 'hr_officer' && userRole !== 'payroll_officer') {
      return res.status(403).json({ error: 'Only Admin, HR, or Payroll Officer can reject declarations' });
    }

    if (!rejectionReason) {
      return res.status(400).json({ error: 'Rejection reason is required' });
    }

    const declarationCheck = await pool.query(
      `SELECT td.id FROM tax_declarations td
       JOIN employees e ON td.employee_id = e.id
       WHERE td.id = $1 AND e.company_id = $2`,
      [id, companyId]
    );

    if (declarationCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Tax declaration not found' });
    }

    await pool.query(
      'UPDATE tax_declarations SET status = $1, approved_by = $2, rejection_reason = $3, updated_at = NOW() WHERE id = $4',
      ['rejected', userId, rejectionReason, id]
    );

    res.json({ message: 'Tax declaration rejected successfully' });
  } catch (error) {
    console.error('Reject tax declaration error:', error);
    res.status(500).json({ error: 'Failed to reject tax declaration' });
  }
};
