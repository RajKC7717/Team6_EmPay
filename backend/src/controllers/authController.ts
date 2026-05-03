import { Request, Response } from 'express';
import pool from '../config/database';
import { hashPassword, comparePassword, generateToken, checkAccountLock, incrementFailedAttempts, resetFailedAttempts } from '../utils/authUtils';
import { registerSchema, loginSchema, changePasswordSchema, resetPasswordRequestSchema, resetPasswordSchema } from '../utils/validators';
import { sendEmail } from '../services/emailService';

export const register = async (req: Request, res: Response) => {
  try {
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { name, email, password, companyName, companyCode, phone, address } = value;

    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const existingCompany = await pool.query('SELECT id FROM companies WHERE company_code = $1', [companyCode]);
    if (existingCompany.rows.length > 0) {
      return res.status(400).json({ error: 'Company code already exists' });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const companyResult = await client.query(
        'INSERT INTO companies (name, company_code, email, phone, address) VALUES ($1, $2, $3, $4, $5) RETURNING id',
        [companyName, companyCode, email, phone, address]
      );
      const companyId = companyResult.rows[0].id;

      const passwordHash = await hashPassword(password);
      const userResult = await client.query(
        'INSERT INTO users (company_id, email, password_hash, role, is_active) VALUES ($1, $2, $3, $4, $5) RETURNING id, email, role, company_id',
        [companyId, email, passwordHash, 'admin', true]
      );

      await client.query(
        `INSERT INTO leave_types (company_id, name, is_paid, default_days, carry_forward, max_carry_forward_days) VALUES 
        ($1, 'Paid Time Off', true, 18, true, 5),
        ($1, 'Sick Leave', true, 6, false, 0),
        ($1, 'Unpaid Leave', false, 0, false, 0)`,
        [companyId]
      );

      await client.query('COMMIT');

      const user = userResult.rows[0];
      const token = generateToken(user);

      res.status(201).json({
        message: 'Registration successful',
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          company_id: user.company_id,
        },
      });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { email, password } = value;

    // Support login via email OR login_id
    const result = await pool.query(
      'SELECT id, company_id, login_id, email, password_hash, role, is_active, first_login FROM users WHERE email = $1 OR login_id = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email/login ID or password' });
    }

    const user = result.rows[0];

    if (!user.is_active) {
      return res.status(403).json({ error: 'Account has been deactivated. Contact admin.' });
    }

    const isLocked = await checkAccountLock(user.id);
    if (isLocked) {
      return res.status(403).json({ error: 'Account locked. Try again after 15 minutes.' });
    }

    const isValidPassword = await comparePassword(password, user.password_hash);
    if (!isValidPassword) {
      await incrementFailedAttempts(user.id);
      return res.status(401).json({ error: 'Invalid email/login ID or password' });
    }

    await resetFailedAttempts(user.id);

    const token = generateToken(user);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        company_id: user.company_id,
        first_login: user.first_login,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

export const changePassword = async (req: Request, res: Response) => {
  try {
    const { error, value } = changePasswordSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { currentPassword, newPassword } = value;
    const userId = (req as any).user.id;

    const result = await pool.query('SELECT password_hash FROM users WHERE id = $1', [userId]);
    const user = result.rows[0];

    const isValidPassword = await comparePassword(currentPassword, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    const newPasswordHash = await hashPassword(newPassword);
    await pool.query(
      'UPDATE users SET password_hash = $1, first_login = false, updated_at = NOW() WHERE id = $2',
      [newPasswordHash, userId]
    );

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
};

export const requestPasswordReset = async (req: Request, res: Response) => {
  try {
    const { error, value } = resetPasswordRequestSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { email } = value;

    const result = await pool.query('SELECT id, email FROM users WHERE email = $1', [email]);

    res.json({ message: 'If email exists, a reset link has been sent.' });

    if (result.rows.length === 0) return;

    const user = result.rows[0];
    const resetToken = generateToken({ id: user.id, email: user.email });

    await sendEmail({
      to: email,
      subject: 'Password Reset Request',
      html: `
        <p>Click the link below to reset your password:</p>
        <a href="${process.env.FRONTEND_URL}/reset-password?token=${resetToken}">Reset Password</a>
        <p>This link expires in 30 minutes.</p>
      `,
    });
  } catch (error) {
    console.error('Password reset request error:', error);
    res.status(500).json({ error: 'Failed to process request' });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { error, value } = resetPasswordSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { token, newPassword } = value;

    const decoded = require('../utils/authUtils').verifyToken(token);
    const userId = decoded.id;

    const newPasswordHash = await hashPassword(newPassword);
    await pool.query(
      'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
      [newPasswordHash, userId]
    );

    await pool.query('UPDATE users SET account_locked_until = NULL, failed_login_attempts = 0 WHERE id = $1', [userId]);

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(400).json({ error: 'Invalid or expired reset token' });
  }
};

export const logout = async (req: Request, res: Response) => {
  res.json({ message: 'Logout successful' });
};
