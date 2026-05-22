import { Router } from 'express';
import { authMiddleware, requireRole, AuthRequest } from '../middleware/auth.js';
import db from '../db/database.js';

const router = Router();

router.get('/', authMiddleware, requireRole('admin'), (_req: AuthRequest, res) => {
  const users = db.prepare('SELECT id, username, role, created_at FROM users ORDER BY created_at DESC').all();
  res.json(users);
});

router.put('/:id/role', authMiddleware, requireRole('admin'), (req: AuthRequest, res) => {
  const { id } = req.params;
  const { role } = req.body;
  if (!['admin', 'editor', 'reader'].includes(role)) {
    res.status(400).json({ error: '无效的角色' });
    return;
  }
  db.prepare('UPDATE users SET role = ? WHERE id = ?').run(role, id);
  res.json({ success: true });
});

router.delete('/:id', authMiddleware, requireRole('admin'), (req: AuthRequest, res) => {
  const { id } = req.params;
  if (parseInt(id, 10) === req.user!.id) {
    res.status(400).json({ error: '不能删除自己' });
    return;
  }
  db.prepare('DELETE FROM users WHERE id = ?').run(id);
  res.json({ success: true });
});

export default router;
