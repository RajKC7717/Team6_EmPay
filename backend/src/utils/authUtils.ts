import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import pool from '../config/database';
import { User } from '../types';

const SALT_ROUNDS = 10;

// ✅ Force correct typing (avoids undefined issues)
const JWT_SECRET: string = process.env.JWT_SECRET || 'your-secret-key';

// ✅ Explicit typing for expiresIn (VERY IMPORTANT)
const JWT_EXPIRES_IN: SignOptions['expiresIn'] =
  (process.env.JWT_EXPIRES_IN as SignOptions['expiresIn']) || '7d';

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

export const comparePassword = async (
  password: string,
  hash: string
): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

// ✅ FIXED TOKEN GENERATION
export const generateToken = (user: Partial<User>): string => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      company_id: user.company_id,
    },
    JWT_SECRET as string,
    {
      expiresIn: JWT_EXPIRES_IN as any,
    }
  );
};


// ✅ VERIFY TOKEN (typed safely)
export const verifyToken = (token: string): jwt.JwtPayload => {
  try {
    return jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

// ✅ ACCOUNT LOCK CHECK
export const checkAccountLock = async (userId: number): Promise<boolean> => {
  const query = 'SELECT account_locked_until FROM users WHERE id = $1';
  const result = await pool.query(query, [userId]);

  if (!result.rows[0]?.account_locked_until) return false;

  const lockUntil = new Date(result.rows[0].account_locked_until);
  const now = new Date();

  if (now < lockUntil) {
    return true;
  }

  // Reset lock if expired
  await pool.query(
    'UPDATE users SET account_locked_until = NULL, failed_login_attempts = 0 WHERE id = $1',
    [userId]
  );

  return false;
};

// ✅ INCREMENT FAILED LOGIN ATTEMPTS
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

// ✅ RESET FAILED ATTEMPTS
export const resetFailedAttempts = async (userId: number): Promise<void> => {
  await pool.query(
    'UPDATE users SET failed_login_attempts = 0, account_locked_until = NULL WHERE id = $1',
    [userId]
  );
};
