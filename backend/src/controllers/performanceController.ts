import { Request, Response } from 'express';
import pool from '../config/database';

export const createPerformanceReview = async (req: Request, res: Response) => {
  try {
    const {
      employeeId,
      reviewPeriodStart,
      reviewPeriodEnd,
      rating,
      strengths,
      areasForImprovement,
      goals,
      comments
    } = req.body;

    const reviewerId = (req as any).user.id;
    const userRole = (req as any).user.role;
    const companyId = (req as any).user.company_id;

    if (userRole !== 'admin' && userRole !== 'hr_officer') {
      return res.status(403).json({ error: 'Only Admin and HR Officer can create performance reviews' });
    }

    const employeeCheck = await pool.query(
      'SELECT id FROM employees WHERE id = $1 AND company_id = $2',
      [employeeId, companyId]
    );

    if (employeeCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    const result = await pool.query(
      `INSERT INTO performance_reviews (
        employee_id, reviewer_id, review_period_start, review_period_end,
        rating, strengths, areas_for_improvement, goals, comments, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
      [
        employeeId, reviewerId, reviewPeriodStart, reviewPeriodEnd,
        rating, strengths, areasForImprovement, goals, comments, 'draft'
      ]
    );

    res.status(201).json({
      message: 'Performance review created successfully',
      review: result.rows[0]
    });
  } catch (error) {
    console.error('Create performance review error:', error);
    res.status(500).json({ error: 'Failed to create performance review' });
  }
};

export const getPerformanceReviews = async (req: Request, res: Response) => {
  try {
    const userRole = (req as any).user.role;
    const userId = (req as any).user.id;
    const companyId = (req as any).user.company_id;

    const { employeeId, status } = req.query;

    let query = `
      SELECT pr.*, 
             e.first_name, e.last_name, e.department, e.designation,
             u.email as reviewer_email
      FROM performance_reviews pr
      JOIN employees e ON pr.employee_id = e.id
      JOIN users u ON pr.reviewer_id = u.id
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
        query += ` AND pr.employee_id = $${paramIndex}`;
        params.push(employeeResult.rows[0].id);
        paramIndex++;
      }
    }

    if (employeeId && (userRole === 'admin' || userRole === 'hr_officer')) {
      query += ` AND pr.employee_id = $${paramIndex}`;
      params.push(employeeId);
      paramIndex++;
    }

    if (status) {
      query += ` AND pr.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    query += ' ORDER BY pr.created_at DESC';

    const result = await pool.query(query, params);

    res.json({ reviews: result.rows });
  } catch (error) {
    console.error('Get performance reviews error:', error);
    res.status(500).json({ error: 'Failed to fetch performance reviews' });
  }
};

export const updatePerformanceReview = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userRole = (req as any).user.role;
    const companyId = (req as any).user.company_id;

    if (userRole !== 'admin' && userRole !== 'hr_officer') {
      return res.status(403).json({ error: 'Only Admin and HR Officer can update performance reviews' });
    }

    const reviewCheck = await pool.query(
      `SELECT pr.id FROM performance_reviews pr
       JOIN employees e ON pr.employee_id = e.id
       WHERE pr.id = $1 AND e.company_id = $2`,
      [id, companyId]
    );

    if (reviewCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Performance review not found' });
    }

    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    const allowedFields = [
      'rating', 'strengths', 'areas_for_improvement', 'goals', 'comments', 'status'
    ];

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
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

    const query = `UPDATE performance_reviews SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
    const result = await pool.query(query, values);

    res.json({
      message: 'Performance review updated successfully',
      review: result.rows[0]
    });
  } catch (error) {
    console.error('Update performance review error:', error);
    res.status(500).json({ error: 'Failed to update performance review' });
  }
};

export const deletePerformanceReview = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userRole = (req as any).user.role;
    const companyId = (req as any).user.company_id;

    if (userRole !== 'admin' && userRole !== 'hr_officer') {
      return res.status(403).json({ error: 'Only Admin and HR Officer can delete performance reviews' });
    }

    const reviewCheck = await pool.query(
      `SELECT pr.id FROM performance_reviews pr
       JOIN employees e ON pr.employee_id = e.id
       WHERE pr.id = $1 AND e.company_id = $2`,
      [id, companyId]
    );

    if (reviewCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Performance review not found' });
    }

    await pool.query('DELETE FROM performance_reviews WHERE id = $1', [id]);

    res.json({ message: 'Performance review deleted successfully' });
  } catch (error) {
    console.error('Delete performance review error:', error);
    res.status(500).json({ error: 'Failed to delete performance review' });
  }
};

export const createGoal = async (req: Request, res: Response) => {
  try {
    const { employeeId, title, description, targetDate } = req.body;
    const createdBy = (req as any).user.id;
    const userRole = (req as any).user.role;
    const companyId = (req as any).user.company_id;

    if (userRole !== 'admin' && userRole !== 'hr_officer') {
      return res.status(403).json({ error: 'Only Admin and HR Officer can create goals' });
    }

    const employeeCheck = await pool.query(
      'SELECT id FROM employees WHERE id = $1 AND company_id = $2',
      [employeeId, companyId]
    );

    if (employeeCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    const result = await pool.query(
      `INSERT INTO goals (employee_id, title, description, target_date, status, progress, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [employeeId, title, description, targetDate, 'not_started', 0, createdBy]
    );

    res.status(201).json({
      message: 'Goal created successfully',
      goal: result.rows[0]
    });
  } catch (error) {
    console.error('Create goal error:', error);
    res.status(500).json({ error: 'Failed to create goal' });
  }
};

export const getGoals = async (req: Request, res: Response) => {
  try {
    const userRole = (req as any).user.role;
    const userId = (req as any).user.id;
    const companyId = (req as any).user.company_id;

    const { employeeId, status } = req.query;

    let query = `
      SELECT g.*, 
             e.first_name, e.last_name, e.department,
             u.email as created_by_email
      FROM goals g
      JOIN employees e ON g.employee_id = e.id
      LEFT JOIN users u ON g.created_by = u.id
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
        query += ` AND g.employee_id = $${paramIndex}`;
        params.push(employeeResult.rows[0].id);
        paramIndex++;
      }
    }

    if (employeeId && (userRole === 'admin' || userRole === 'hr_officer')) {
      query += ` AND g.employee_id = $${paramIndex}`;
      params.push(employeeId);
      paramIndex++;
    }

    if (status) {
      query += ` AND g.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    query += ' ORDER BY g.created_at DESC';

    const result = await pool.query(query, params);

    res.json({ goals: result.rows });
  } catch (error) {
    console.error('Get goals error:', error);
    res.status(500).json({ error: 'Failed to fetch goals' });
  }
};

export const updateGoal = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userRole = (req as any).user.role;
    const userId = (req as any).user.id;
    const companyId = (req as any).user.company_id;

    const goalCheck = await pool.query(
      `SELECT g.id, g.employee_id, e.user_id FROM goals g
       JOIN employees e ON g.employee_id = e.id
       WHERE g.id = $1 AND e.company_id = $2`,
      [id, companyId]
    );

    if (goalCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    const goal = goalCheck.rows[0];
    const isOwnGoal = goal.user_id === userId;
    const canEditAll = userRole === 'admin' || userRole === 'hr_officer';

    if (!isOwnGoal && !canEditAll) {
      return res.status(403).json({ error: 'You do not have permission to update this goal' });
    }

    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    const allowedFields = isOwnGoal && userRole === 'employee'
      ? ['progress', 'status']
      : ['title', 'description', 'target_date', 'status', 'progress'];

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
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

    const query = `UPDATE goals SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
    const result = await pool.query(query, values);

    res.json({
      message: 'Goal updated successfully',
      goal: result.rows[0]
    });
  } catch (error) {
    console.error('Update goal error:', error);
    res.status(500).json({ error: 'Failed to update goal' });
  }
};

export const deleteGoal = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userRole = (req as any).user.role;
    const companyId = (req as any).user.company_id;

    if (userRole !== 'admin' && userRole !== 'hr_officer') {
      return res.status(403).json({ error: 'Only Admin and HR Officer can delete goals' });
    }

    const goalCheck = await pool.query(
      `SELECT g.id FROM goals g
       JOIN employees e ON g.employee_id = e.id
       WHERE g.id = $1 AND e.company_id = $2`,
      [id, companyId]
    );

    if (goalCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    await pool.query('DELETE FROM goals WHERE id = $1', [id]);

    res.json({ message: 'Goal deleted successfully' });
  } catch (error) {
    console.error('Delete goal error:', error);
    res.status(500).json({ error: 'Failed to delete goal' });
  }
};
