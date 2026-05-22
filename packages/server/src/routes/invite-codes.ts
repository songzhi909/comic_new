import { Router } from 'express';
import { authMiddleware, requireRole, AuthRequest } from '../middleware/auth.js';
import db from '../db/database.js';
import crypto from 'crypto';

const router = Router();

router.get('/', authMiddleware, requireRole('admin'), (_req: AuthRequest, res) => {
  const codes = db.prepare('SELECT * FROM invite_codes ORDER BY created_at DESC').all();
  res.json(codes);
});

router.post('/', authMiddleware, requireRole('admin'), (req: AuthRequest, res) => {
  const { role, max_uses, expires_at } = req.body;
  if (!role || !['editor', 'reader'].includes(role)) {
    res.status(400).json({ error: '角色必须是 editor 或 reader' });
    return;
  }

  const code = crypto.randomBytes(8).toString('hex');
  const result = db.prepare(
    'INSERT INTO invite_codes (code, role, max_uses, expires_at, created_by) VALUES (?, ?, ?, ?, ?)'
  ).run(code, role, max_uses || 1, expires_at || null, req.user!.id);

  res.json({ id: result.lastInsertRowid, code, role, max_uses: max_uses || 1 });
});

router.delete('/:id', authMiddleware, requireRole('admin'), (req: AuthRequest, res) => {
  const { id } = req.params;
  db.prepare('DELETE FROM invite_codes WHERE id = ?').run(id);
  res.json({ success: true });
});

export default router;
