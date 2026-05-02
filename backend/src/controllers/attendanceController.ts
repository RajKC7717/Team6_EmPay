import { Request, Response } from 'express';
import pool from '../config/database';

export const checkIn = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const companyId = (req as any).user.company_id;
    const { location } = req.body;

    const employeeResult = await pool.query(
      'SELECT id FROM employees WHERE user_id = $1 AND company_id = $2',
      [userId, companyId]
    );

    if (employeeResult.rows.length === 0) {
      return res.status(404).json({ error: 'Employee profile not found' });
    }

    const employeeId = employeeResult.rows[0].id;
    const today = new Date().toISOString().split('T')[0];

    const existingAttendance = await pool.query(
      'SELECT id, check_in_time, check_out_time FROM attendance WHERE employee_id = $1 AND date = $2',
      [employeeId, today]
    );

    if (existingAttendance.rows.length > 0) {
      const attendance = existingAttendance.rows[0];
      if (attendance.check_in_time && !attendance.check_out_time) {
        return res.status(400).json({ error: 'Already checked in today' });
      }
      if (attendance.check_out_time) {
        return res.status(400).json({ error: 'Attendance already marked for today' });
      }
    }

    const leaveCheck = await pool.query(
      `SELECT lr.id FROM leave_requests lr
       WHERE lr.employee_id = $1 
       AND lr.status = 'approved'
       AND $2 BETWEEN lr.from_date AND lr.to_date`,
      [employeeId, today]
    );

    if (leaveCheck.rows.length > 0) {
      return res.status(400).json({ error: 'You are on approved leave today. Cannot mark attendance.' });
    }

    const result = await pool.query(
      `INSERT INTO attendance (employee_id, date, check_in_time, location, status)
       VALUES ($1, $2, NOW(), $3, 'present')
       RETURNING *`,
      [employeeId, today, location || null]
    );

    res.status(201).json({
      message: 'Checked in successfully',
      attendance: result.rows[0]
    });
  } catch (error) {
    console.error('Check-in error:', error);
    res.status(500).json({ error: 'Failed to check in' });
  }
};

export const checkOut = async (req: Request, res: Response) => {
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
    const today = new Date().toISOString().split('T')[0];

    const attendanceResult = await pool.query(
      'SELECT id, check_in_time, check_out_time FROM attendance WHERE employee_id = $1 AND date = $2',
      [employeeId, today]
    );

    if (attendanceResult.rows.length === 0 || !attendanceResult.rows[0].check_in_time) {
      return res.status(400).json({ error: 'Cannot check out without checking in' });
    }

    const attendance = attendanceResult.rows[0];

    if (attendance.check_out_time) {
      return res.status(400).json({ error: 'Already checked out today' });
    }

    const checkInTime = new Date(attendance.check_in_time);
    const checkOutTime = new Date();
    const durationMinutes = Math.floor((checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60));

    let status = 'present';
    if (durationMinutes >= 240 && durationMinutes < 480) {
      status = 'half_day';
    } else if (durationMinutes >= 480) {
      status = 'present';
    }

    const result = await pool.query(
      `UPDATE attendance 
       SET check_out_time = NOW(), duration_minutes = $1, status = $2, updated_at = NOW()
       WHERE id = $3
       RETURNING *`,
      [durationMinutes, status, attendance.id]
    );

    res.json({
      message: 'Checked out successfully',
      attendance: result.rows[0]
    });
  } catch (error) {
    console.error('Check-out error:', error);
    res.status(500).json({ error: 'Failed to check out' });
  }
};

export const getAttendanceStatus = async (req: Request, res: Response) => {
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
    const today = new Date().toISOString().split('T')[0];

    const attendanceResult = await pool.query(
      'SELECT * FROM attendance WHERE employee_id = $1 AND date = $2',
      [employeeId, today]
    );

    const leaveResult = await pool.query(
      `SELECT lr.id, lt.name as leave_type 
       FROM leave_requests lr
       JOIN leave_types lt ON lr.leave_type_id = lt.id
       WHERE lr.employee_id = $1 
       AND lr.status = 'approved'
       AND $2 BETWEEN lr.from_date AND lr.to_date`,
      [employeeId, today]
    );

    let statusType = 'not_marked';
    let attendance = null;
    let onLeave = false;
    let leaveType = null;

    if (leaveResult.rows.length > 0) {
      statusType = 'on_leave';
      onLeave = true;
      leaveType = leaveResult.rows[0].leave_type;
    } else if (attendanceResult.rows.length > 0) {
      attendance = attendanceResult.rows[0];
      if (attendance.check_in_time && !attendance.check_out_time) {
        statusType = 'checked_in';
      } else if (attendance.check_out_time) {
        statusType = 'checked_out';
      }
    }

    res.json({
      statusType,
      attendance,
      onLeave,
      leaveType,
      date: today
    });
  } catch (error) {
    console.error('Get attendance status error:', error);
    res.status(500).json({ error: 'Failed to fetch attendance status' });
  }
};

export const getAttendanceHistory = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const userRole = (req as any).user.role;
    const companyId = (req as any).user.company_id;
    const { employeeId, startDate, endDate, status } = req.query;

    let query = `
      SELECT a.*, e.first_name, e.last_name, e.department
      FROM attendance a
      JOIN employees e ON a.employee_id = e.id
      WHERE e.company_id = $1
    `;
    const params: any[] = [companyId];
    let paramIndex = 2;

    if (userRole === 'employee') {
      const empResult = await pool.query(
        'SELECT id FROM employees WHERE user_id = $1',
        [userId]
      );
      if (empResult.rows.length > 0) {
        query += ` AND a.employee_id = $${paramIndex}`;
        params.push(empResult.rows[0].id);
        paramIndex++;
      }
    } else if (employeeId) {
      query += ` AND a.employee_id = $${paramIndex}`;
      params.push(employeeId);
      paramIndex++;
    }

    if (startDate) {
      query += ` AND a.date >= $${paramIndex}`;
      params.push(startDate);
      paramIndex++;
    }

    if (endDate) {
      query += ` AND a.date <= $${paramIndex}`;
      params.push(endDate);
      paramIndex++;
    }

    if (status) {
      query += ` AND a.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    query += ' ORDER BY a.date DESC';

    const result = await pool.query(query, params);

    res.json({ attendance: result.rows });
  } catch (error) {
    console.error('Get attendance history error:', error);
    res.status(500).json({ error: 'Failed to fetch attendance history' });
  }
};
