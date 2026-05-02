import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../config/database';
import { User } from '../types';

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

export const generateToken = (user: Partial<User>): string => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      company_id: user.company_id,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

export const verifyToken = (token: string): any => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

export const checkAccountLock = async (userId: number): Promise<boolean> => {
  const query = 'SELECT account_locked_until FROM users WHERE id = $1';
  const result = await pool.query(query, [userId]);
  
  if (!result.rows[0]?.account_locked_until) return false;
  
  const lockUntil = new Date(result.rows[0].account_locked_until);
  const now = new Date();
  
  if (now < lockUntil) {
    return true;
  }
  
  await pool.query(
    'UPDATE users SET account_locked_until = NULL, failed_login_attempts = 0 WHERE id = $1',
    [userId]
  );
  
  return false;
};

export const incrementFailedAttempts = async (userId: number): Promise<void> => {
  const query = `
    UPDATE users 
    SET failed_login_attempts = failed_login_attempts + 1,
        account_locked_until = CASE 
          WHEN failed_login_attempts + 1 >= 5 
          THEN NOW() + INTERVAL '15 minutes'
          ELSE account_locked_until
        END
    WHERE id = $1
  `;
  
  await pool.query(query, [userId]);
};

export const resetFailedAttempts = async (userId: number): Promise<void> => {
  await pool.query(
    'UPDATE users SET failed_login_attempts = 0, account_locked_until = NULL WHERE id = $1',
    [userId]
  );
};
