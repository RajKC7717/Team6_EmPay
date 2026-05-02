import { Request, Response } from 'express';
import pool from '../config/database';
import { hashPassword } from '../utils/authUtils';
import { generateLoginId, generatePassword, getNextSerialNumber } from '../utils/loginIdGenerator';
import { sendWelcomeEmail } from '../services/emailService';
import { parseResume } from '../services/resumeParser';
import { createEmployeeSchema } from '../utils/validators';

export const createEmployee = async (req: Request, res: Response) => {
  try {
    const { error, value } = createEmployeeSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const {
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth,
      gender,
      address,
      emergencyContactName,
      emergencyContactPhone,
      department,
      designation,
      dateOfJoining,
      employmentType,
      reportingManagerId,
      basicWage,
      pfApplicable,
      professionalTaxApplicable,
      bankAccountNumber,
      bankIfscCode
    } = req.body;

    const companyId = (req as any).user.company_id;
    const userRole = (req as any).user.role;

    if (userRole !== 'admin' && userRole !== 'hr_officer') {
      return res.status(403).json({ error: 'Only Admin and HR Officer can create employees' });
    }

    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Email already in use by another user' });
    }

    const joiningDate = new Date(dateOfJoining);
    if (joiningDate > new Date()) {
      return res.status(400).json({ error: 'Joining date cannot be in the future' });
    }

    const companyResult = await pool.query('SELECT company_code FROM companies WHERE id = $1', [companyId]);
    const companyCode = companyResult.rows[0].company_code;

    const joiningYear = joiningDate.getFullYear();
    const serialNumber = await getNextSerialNumber(joiningYear);
    
    const loginId = await generateLoginId({
      companyCode,
      firstName,
      lastName,
      joiningYear
    });

    const tempPassword = generatePassword();
    const passwordHash = await hashPassword(tempPassword);

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const userResult = await client.query(
        `INSERT INTO users (company_id, login_id, email, password_hash, role, is_active, first_login) 
         VALUES ($1, $2, $3, $4, $5, $6, $7) 
         RETURNING id`,
        [companyId, loginId, email, passwordHash, 'employee', true, true]
      );
      const userId = userResult.rows[0].id;

      const employeeResult = await client.query(
        `INSERT INTO employees (
          user_id, company_id, first_name, last_name, date_of_birth, gender, phone, address,
          emergency_contact_name, emergency_contact_phone, department, designation, 
          date_of_joining, employment_type, reporting_manager_id, basic_wage, 
          pf_applicable, professional_tax_applicable, bank_account_number, bank_ifsc_code,
          serial_number, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)
        RETURNING id`,
        [
          userId, companyId, firstName, lastName, dateOfBirth, gender, phone, address,
          emergencyContactName, emergencyContactPhone, department, designation,
          dateOfJoining, employmentType, reportingManagerId, basicWage,
          pfApplicable, professionalTaxApplicable, bankAccountNumber, bankIfscCode,
          serialNumber, 'active'
        ]
      );
      const employeeId = employeeResult.rows[0].id;

      const leaveTypesResult = await client.query(
        'SELECT id, default_days FROM leave_types WHERE company_id = $1',
        [companyId]
      );

      for (const leaveType of leaveTypesResult.rows) {
        await client.query(
          `INSERT INTO leave_allocations (employee_id, leave_type_id, total_days, used_days, remaining_days, validity_year)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [employeeId, leaveType.id, leaveType.default_days, 0, leaveType.default_days, new Date().getFullYear()]
        );
      }

      await client.query('COMMIT');

      await sendWelcomeEmail(email, loginId, tempPassword, `${firstName} ${lastName}`);

      res.status(201).json({
        message: 'Employee created successfully',
        employee: {
          id: employeeId,
          userId,
          loginId,
          firstName,
          lastName,
          email,
          department,
          designation
        }
      });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Create employee error:', error);
    res.status(500).json({ error: 'Failed to create employee' });
  }
};

export const uploadResume = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No resume file uploaded' });
    }

    const parsedData = await parseResume(req.file.buffer);

    res.json({
      message: 'Resume parsed successfully',
      data: parsedData
    });
  } catch (error) {
    console.error('Resume upload error:', error);
    res.status(500).json({ error: 'Failed to parse resume' });
  }
};

export const getEmployees = async (req: Request, res: Response) => {
  try {
    const companyId = (req as any).user.company_id;
    const userRole = (req as any).user.role;
    const userId = (req as any).user.id;

    const { department, status, search } = req.query;

    let query = `
      SELECT e.*, u.email, u.login_id, u.is_active,
             m.first_name as manager_first_name, m.last_name as manager_last_name
      FROM employees e
      JOIN users u ON e.user_id = u.id
      LEFT JOIN employees m ON e.reporting_manager_id = m.id
      WHERE e.company_id = $1
    `;
    const params: any[] = [companyId];
    let paramIndex = 2;

    if (userRole === 'employee') {
      query += ` AND e.user_id = $${paramIndex}`;
      params.push(userId);
      paramIndex++;
    }

    if (department) {
      query += ` AND e.department = $${paramIndex}`;
      params.push(department);
      paramIndex++;
    }

    if (status) {
      query += ` AND e.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (search) {
      query += ` AND (e.first_name ILIKE $${paramIndex} OR e.last_name ILIKE $${paramIndex} OR u.email ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    query += ' ORDER BY e.created_at DESC';

    const result = await pool.query(query, params);

    res.json({
      employees: result.rows
    });
  } catch (error) {
    console.error('Get employees error:', error);
    res.status(500).json({ error: 'Failed to fetch employees' });
  }
};

export const getEmployeeById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const companyId = (req as any).user.company_id;
    const userRole = (req as any).user.role;
    const userId = (req as any).user.id;

    const result = await pool.query(
      `SELECT e.*, u.email, u.login_id, u.is_active,
              m.first_name as manager_first_name, m.last_name as manager_last_name
       FROM employees e
       JOIN users u ON e.user_id = u.id
       LEFT JOIN employees m ON e.reporting_manager_id = m.id
       WHERE e.id = $1 AND e.company_id = $2`,
      [id, companyId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    const employee = result.rows[0];

    if (userRole === 'employee' && employee.user_id !== userId) {
      return res.status(403).json({ error: 'You can only view your own profile' });
    }

    res.json({ employee });
  } catch (error) {
    console.error('Get employee error:', error);
    res.status(500).json({ error: 'Failed to fetch employee' });
  }
};

export const updateEmployee = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const companyId = (req as any).user.company_id;
    const userRole = (req as any).user.role;
    const userId = (req as any).user.id;

    const employeeResult = await pool.query(
      'SELECT user_id FROM employees WHERE id = $1 AND company_id = $2',
      [id, companyId]
    );

    if (employeeResult.rows.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    const employee = employeeResult.rows[0];

    const isOwnProfile = employee.user_id === userId;
    const canEditAll = userRole === 'admin' || userRole === 'hr_officer';

    if (!isOwnProfile && !canEditAll) {
      return res.status(403).json({ error: 'You do not have permission to edit this employee' });
    }

    const allowedFields = isOwnProfile && userRole === 'employee'
      ? ['phone', 'address', 'emergency_contact_name', 'emergency_contact_phone', 'profile_photo_url', 'bank_account_number', 'bank_ifsc_code']
      : Object.keys(req.body);

    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    const editableFields = [
      'first_name', 'last_name', 'date_of_birth', 'gender', 'phone', 'address',
      'emergency_contact_name', 'emergency_contact_phone', 'department', 'designation',
      'employment_type', 'reporting_manager_id', 'basic_wage', 'pf_applicable',
      'professional_tax_applicable', 'profile_photo_url', 'bank_account_number', 'bank_ifsc_code', 'status'
    ];

    for (const field of allowedFields) {
      if (req.body[field] !== undefined && editableFields.includes(field)) {
        updates.push(`${field} = $${paramIndex}`);
        values.push(req.body[field]);
        paramIndex++;
      }
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    updates.push(`updated_at = NOW()`);
    values.push(id);

    const query = `UPDATE employees SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
    const result = await pool.query(query, values);

    res.json({
      message: 'Employee updated successfully',
      employee: result.rows[0]
    });
  } catch (error) {
    console.error('Update employee error:', error);
    res.status(500).json({ error: 'Failed to update employee' });
  }
};

export const deactivateEmployee = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const companyId = (req as any).user.company_id;
    const userRole = (req as any).user.role;

    if (userRole !== 'admin' && userRole !== 'hr_officer') {
      return res.status(403).json({ error: 'Only Admin and HR Officer can deactivate employees' });
    }

    const employeeResult = await pool.query(
      'SELECT user_id FROM employees WHERE id = $1 AND company_id = $2',
      [id, companyId]
    );

    if (employeeResult.rows.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    const userId = employeeResult.rows[0].user_id;

    await pool.query('UPDATE employees SET status = $1, updated_at = NOW() WHERE id = $2', ['inactive', id]);
    await pool.query('UPDATE users SET is_active = $1, updated_at = NOW() WHERE id = $2', [false, userId]);

    res.json({ message: 'Employee deactivated successfully' });
  } catch (error) {
    console.error('Deactivate employee error:', error);
    res.status(500).json({ error: 'Failed to deactivate employee' });
  }
};
