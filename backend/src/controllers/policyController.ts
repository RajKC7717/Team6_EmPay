import { Request, Response } from 'express';
import pool from '../config/database';

export const createPolicy = async (req: Request, res: Response) => {
  try {
    const { title, category, content, fileUrl } = req.body;
    const createdBy = (req as any).user.id;
    const userRole = (req as any).user.role;
    const companyId = (req as any).user.company_id;

    if (userRole !== 'admin') {
      return res.status(403).json({ error: 'Only Admin can create policies' });
    }

    const result = await pool.query(
      `INSERT INTO policies (company_id, title, category, content, file_url, is_active, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [companyId, title, category, content, fileUrl, true, createdBy]
    );

    res.status(201).json({
      message: 'Policy created successfully',
      policy: result.rows[0]
    });
  } catch (error) {
    console.error('Create policy error:', error);
    res.status(500).json({ error: 'Failed to create policy' });
  }
};

export const getPolicies = async (req: Request, res: Response) => {
  try {
    const companyId = (req as any).user.company_id;
    const { category, isActive } = req.query;

    let query = `
      SELECT p.*, u.email as created_by_email
      FROM policies p
      LEFT JOIN users u ON p.created_by = u.id
      WHERE p.company_id = $1
    `;
    const params: any[] = [companyId];
    let paramIndex = 2;

    if (category) {
      query += ` AND p.category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    if (isActive !== undefined) {
      query += ` AND p.is_active = $${paramIndex}`;
      params.push(isActive === 'true');
      paramIndex++;
    }

    query += ' ORDER BY p.created_at DESC';

    const result = await pool.query(query, params);

    res.json({ policies: result.rows });
  } catch (error) {
    console.error('Get policies error:', error);
    res.status(500).json({ error: 'Failed to fetch policies' });
  }
};

export const getPolicyById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const companyId = (req as any).user.company_id;

    const result = await pool.query(
      `SELECT p.*, u.email as created_by_email
       FROM policies p
       LEFT JOIN users u ON p.created_by = u.id
       WHERE p.id = $1 AND p.company_id = $2`,
      [id, companyId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Policy not found' });
    }

    res.json({ policy: result.rows[0] });
  } catch (error) {
    console.error('Get policy error:', error);
    res.status(500).json({ error: 'Failed to fetch policy' });
  }
};

export const updatePolicy = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userRole = (req as any).user.role;
    const companyId = (req as any).user.company_id;

    if (userRole !== 'admin') {
      return res.status(403).json({ error: 'Only Admin can update policies' });
    }

    const policyCheck = await pool.query(
      'SELECT id FROM policies WHERE id = $1 AND company_id = $2',
      [id, companyId]
    );

    if (policyCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Policy not found' });
    }

    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    const allowedFields = ['title', 'category', 'content', 'file_url', 'is_active'];

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

    const query = `UPDATE policies SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
    const result = await pool.query(query, values);

    res.json({
      message: 'Policy updated successfully',
      policy: result.rows[0]
    });
  } catch (error) {
    console.error('Update policy error:', error);
    res.status(500).json({ error: 'Failed to update policy' });
  }
};

export const deletePolicy = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userRole = (req as any).user.role;
    const companyId = (req as any).user.company_id;

    if (userRole !== 'admin') {
      return res.status(403).json({ error: 'Only Admin can delete policies' });
    }

    const policyCheck = await pool.query(
      'SELECT id FROM policies WHERE id = $1 AND company_id = $2',
      [id, companyId]
    );

    if (policyCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Policy not found' });
    }

    await pool.query('DELETE FROM policies WHERE id = $1', [id]);

    res.json({ message: 'Policy deleted successfully' });
  } catch (error) {
    console.error('Delete policy error:', error);
    res.status(500).json({ error: 'Failed to delete policy' });
  }
};

export const getPolicyCategories = async (req: Request, res: Response) => {
  try {
    const companyId = (req as any).user.company_id;

    const result = await pool.query(
      'SELECT DISTINCT category FROM policies WHERE company_id = $1 ORDER BY category',
      [companyId]
    );

    const categories = result.rows.map(row => row.category);

    res.json({ categories });
  } catch (error) {
    console.error('Get policy categories error:', error);
    res.status(500).json({ error: 'Failed to fetch policy categories' });
  }
};
