import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/authUtils';

export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
    company_id: number;
  };
}

// ✅ AUTHENTICATE MIDDLEWARE
export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    req.user = decoded as AuthRequest['user'];
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// ✅ FLEXIBLE AUTHORIZE (supports array OR multiple params)
export const authorize = (...rolesInput: (string | string[])[]) => {
  // Flatten roles (handles ['admin', 'hr'] OR 'admin','hr')
  const allowedRoles = rolesInput.flat();

  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Forbidden: Insufficient permissions',
      });
    }

    next();
  };
};
