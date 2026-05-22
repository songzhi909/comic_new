import { Request, Response, NextFunction } from 'express';
import { getUserFromToken } from '../services/auth.js';

export interface AuthRequest extends Request {
  user?: { id: number; username: string; role: string };
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: '未登录' });
    return;
  }

  const token = authHeader.slice(7);
  const user = getUserFromToken(token);
  if (!user) {
    res.status(401).json({ error: '登录已过期' });
    return;
  }

  req.user = { id: user.id, username: user.username, role: user.role };
  next();
}

export function requireRole(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ error: '权限不足' });
      return;
    }
    next();
  };
}
