import { Request, Response } from 'express';
import pool from '../config/database';

export const createLeaveRequest = async (req: Request, res: Response) => {
  try {
    const { leaveTypeId, fromDate, toDate, reason } = req.body;
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

    const from = new Date(fromDate);
    const to = new Date(toDate);

    if (from > to) {
      return res.status(400).json({ error: 'End date must be after start date' });
    }

    const daysRequested = Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    const overlapCheck = await pool.query(
      `SELECT id FROM leave_requests 
       WHERE employee_id = $1 
       AND status IN ('pending', 'approved')
       AND (
         (from_date <= $2 AND to_date >= $2) OR
         (from_date <= $3 AND to_date >= $3) OR
         (from_date >= $2 AND to_date <= $3)
       )`,
      [employeeId, fromDate, toDate]
    );

    if (overlapCheck.rows.length > 0) {
      return res.status(400).json({ error: 'You have an existing leave request for overlapping dates' });
    }

    const attendanceCheck = await pool.query(
      `SELECT date FROM attendance 
       WHERE employee_id = $1 
       AND date BETWEEN $2 AND $3 
       AND status = 'present'`,
      [employeeId, fromDate, toDate]
    );

    if (attendanceCheck.rows.length > 0) {
      return res.status(400).json({ 
        error: 'You have attendance records on some of these dates. Contact HR.' 
      });
    }

    const result = await pool.query(
      `INSERT INTO leave_requests (employee_id, leave_type_id, from_date, to_date, days_requested, reason, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [employeeId, leaveTypeId, fromDate, toDate, daysRequested, reason, 'pending']
    );

    res.status(201).json({
      message: 'Leave request submitted successfully',
      leaveRequest: result.rows[0]
    });
  } catch (error) {
    console.error('Create leave request error:', error);
    res.status(500).json({ error: 'Failed to create leave request' });
  }
};

export const getLeaveRequests = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const userRole = (req as any).user.role;
    const companyId = (req as any).user.company_id;

    const { status, employeeId } = req.query;

    let query = `
      SELECT lr.*, 
             e.first_name, e.last_name, e.department,
             lt.name as leave_type_name, lt.is_paid,
             u.email as approver_email
      FROM leave_requests lr
      JOIN employees e ON lr.employee_id = e.id
      JOIN leave_types lt ON lr.leave_type_id = lt.id
      LEFT JOIN users u ON lr.approved_by = u.id
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
        query += ` AND lr.employee_id = $${paramIndex}`;
        params.push(employeeResult.rows[0].id);
        paramIndex++;
      }
    }

    if (employeeId && (userRole === 'admin' || userRole === 'hr_officer')) {
      query += ` AND lr.employee_id = $${paramIndex}`;
      params.push(employeeId);
      paramIndex++;
    }

    if (status) {
      query += ` AND lr.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    query += ' ORDER BY lr.created_at DESC';

    const result = await pool.query(query, params);

    res.json({ leaveRequests: result.rows });
  } catch (error) {
    console.error('Get leave requests error:', error);
    res.status(500).json({ error: 'Failed to fetch leave requests' });
  }
};

export const approveLeaveRequest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;
    const userRole = (req as any).user.role;
    const companyId = (req as any).user.company_id;

    if (userRole !== 'admin' && userRole !== 'hr_officer') {
      return res.status(403).json({ 
        error: 'Only Admin and HR Officer can approve leave requests' 
      });
    }

    const leaveResult = await pool.query(
      `SELECT lr.*, e.company_id 
       FROM leave_requests lr
       JOIN employees e ON lr.employee_id = e.id
       WHERE lr.id = $1`,
      [id]
    );

    if (leaveResult.rows.length === 0) {
      return res.status(404).json({ error: 'Leave request not found' });
    }

    const leave = leaveResult.rows[0];

    if (leave.company_id !== companyId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (leave.status !== 'pending') {
      return res.status(400).json({ error: 'Leave request has already been processed' });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      await client.query(
        `UPDATE leave_requests 
         SET status = $1, approved_by = $2, updated_at = NOW()
         WHERE id = $3`,
        ['approved', userId, id]
      );

      await client.query(
        `UPDATE leave_allocations 
         SET used_days = used_days + $1, 
             remaining_days = remaining_days - $1,
             updated_at = NOW()
         WHERE employee_id = $2 AND leave_type_id = $3`,
        [leave.days_requested, leave.employee_id, leave.leave_type_id]
      );

      let currentDate = new Date(leave.from_date);
      const endDate = new Date(leave.to_date);

      while (currentDate <= endDate) {
        const dateStr = currentDate.toISOString().split('T')[0];
        
        await client.query(
          `INSERT INTO attendance (employee_id, date, status)
           VALUES ($1, $2, $3)
           ON CONFLICT (employee_id, date) 
           DO UPDATE SET status = $3, updated_at = NOW()`,
          [leave.employee_id, dateStr, 'on_leave']
        );

        currentDate.setDate(currentDate.getDate() + 1);
      }

      await client.query('COMMIT');

      res.json({ message: 'Leave request approved successfully' });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Approve leave error:', error);
    res.status(500).json({ error: 'Failed to approve leave request' });
  }
};

export const rejectLeaveRequest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;
    const userId = (req as any).user.id;
    const userRole = (req as any).user.role;
    const companyId = (req as any).user.company_id;

    if (userRole !== 'admin' && userRole !== 'hr_officer') {
      return res.status(403).json({ 
        error: 'Only Admin and HR Officer can reject leave requests' 
      });
    }

    if (!rejectionReason) {
      return res.status(400).json({ error: 'Rejection reason is required' });
    }

    const leaveResult = await pool.query(
      `SELECT lr.*, e.company_id 
       FROM leave_requests lr
       JOIN employees e ON lr.employee_id = e.id
       WHERE lr.id = $1`,
      [id]
    );

    if (leaveResult.rows.length === 0) {
      return res.status(404).json({ error: 'Leave request not found' });
    }

    const leave = leaveResult.rows[0];

    if (leave.company_id !== companyId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (leave.status !== 'pending') {
      return res.status(400).json({ error: 'Leave request has already been processed' });
    }

    await pool.query(
      `UPDATE leave_requests 
       SET status = $1, approved_by = $2, rejection_reason = $3, updated_at = NOW()
       WHERE id = $4`,
      ['rejected', userId, rejectionReason, id]
    );

    res.json({ message: 'Leave request rejected successfully' });
  } catch (error) {
    console.error('Reject leave error:', error);
    res.status(500).json({ error: 'Failed to reject leave request' });
  }
};

export const cancelLeaveRequest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
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

    const leaveResult = await pool.query(
      'SELECT * FROM leave_requests WHERE id = $1 AND employee_id = $2',
      [id, employeeId]
    );

    if (leaveResult.rows.length === 0) {
      return res.status(404).json({ error: 'Leave request not found' });
    }

    const leave = leaveResult.rows[0];

    if (leave.status !== 'approved' && leave.status !== 'pending') {
      return res.status(400).json({ error: 'Cannot cancel this leave request' });
    }

    const today = new Date();
    const fromDate = new Date(leave.from_date);

    if (fromDate <= today) {
      return res.status(400).json({ 
        error: 'Cannot cancel leave that has already started. Contact HR.' 
      });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      await client.query(
        'UPDATE leave_requests SET status = $1, updated_at = NOW() WHERE id = $2',
        ['cancelled', id]
      );

      if (leave.status === 'approved') {
        await client.query(
          `UPDATE leave_allocations 
           SET used_days = used_days - $1, 
               remaining_days = remaining_days + $1,
               updated_at = NOW()
           WHERE employee_id = $2 AND leave_type_id = $3`,
          [leave.days_requested, leave.employee_id, leave.leave_type_id]
        );

        await client.query(
          `DELETE FROM attendance 
           WHERE employee_id = $1 
           AND date BETWEEN $2 AND $3 
           AND status = 'on_leave'`,
          [leave.employee_id, leave.from_date, leave.to_date]
        );
      }

      await client.query('COMMIT');

      res.json({ message: 'Leave request cancelled successfully' });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Cancel leave error:', error);
    res.status(500).json({ error: 'Failed to cancel leave request' });
  }
};

export const getLeaveBalance = async (req: Request, res: Response) => {
  try {
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

    const result = await pool.query(
      `SELECT la.*, lt.name as leave_type_name, lt.is_paid
       FROM leave_allocations la
       JOIN leave_types lt ON la.leave_type_id = lt.id
       WHERE la.employee_id = $1 AND la.validity_year = $2`,
      [employeeId, new Date().getFullYear()]
    );

    res.json({ leaveBalances: result.rows });
  } catch (error) {
    console.error('Get leave balance error:', error);
    res.status(500).json({ error: 'Failed to fetch leave balance' });
  }
};

export const allocateLeave = async (req: Request, res: Response) => {
  try {
    const { employeeId, leaveTypeId, totalDays, validityYear } = req.body;
    const userRole = (req as any).user.role;
    const companyId = (req as any).user.company_id;

    if (userRole !== 'admin' && userRole !== 'hr_officer') {
      return res.status(403).json({ 
        error: 'Only Admin and HR Officer can allocate leaves' 
      });
    }

    const employeeCheck = await pool.query(
      'SELECT id FROM employees WHERE id = $1 AND company_id = $2',
      [employeeId, companyId]
    );

    if (employeeCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    const existingAllocation = await pool.query(
      'SELECT id, total_days FROM leave_allocations WHERE employee_id = $1 AND leave_type_id = $2 AND validity_year = $3',
      [employeeId, leaveTypeId, validityYear]
    );

    if (existingAllocation.rows.length > 0) {
      await pool.query(
        `UPDATE leave_allocations 
         SET total_days = total_days + $1, 
             remaining_days = remaining_days + $1,
             updated_at = NOW()
         WHERE id = $2`,
        [totalDays, existingAllocation.rows[0].id]
      );

      res.json({ message: 'Leave allocation updated successfully' });
    } else {
      await pool.query(
        `INSERT INTO leave_allocations (employee_id, leave_type_id, total_days, used_days, remaining_days, validity_year)
         VALUES ($1, $2, $3, 0, $3, $4)`,
        [employeeId, leaveTypeId, totalDays, validityYear]
      );

      res.status(201).json({ message: 'Leave allocated successfully' });
    }
  } catch (error) {
    console.error('Allocate leave error:', error);
    res.status(500).json({ error: 'Failed to allocate leave' });
  }
};
