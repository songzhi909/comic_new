import { Router } from 'express';
import { authMiddleware, requireRole, AuthRequest } from '../middleware/auth.js';
import db from '../db/database.js';
import fs from 'fs';

const router = Router();

router.get('/', authMiddleware, (_req: AuthRequest, res) => {
  const libraries = db.prepare('SELECT * FROM libraries ORDER BY created_at DESC').all();
  res.json(libraries);
});

router.post('/', authMiddleware, requireRole('admin'), (req: AuthRequest, res) => {
  const { name, path: libPath } = req.body;
  if (!name || !libPath) {
    res.status(400).json({ error: '名称和路径不能为空' });
    return;
  }

  if (!fs.existsSync(libPath)) {
    res.status(400).json({ error: '路径不存在' });
    return;
  }

  if (!fs.statSync(libPath).isDirectory()) {
    res.status(400).json({ error: '路径必须是目录' });
    return;
  }

  try {
    const result = db.prepare('INSERT INTO libraries (name, path) VALUES (?, ?)').run(name, libPath);
    res.json({ id: result.lastInsertRowid, name, path: libPath });
  } catch (err: any) {
    if (err.message?.includes('UNIQUE')) {
      res.status(400).json({ error: '该路径已被添加' });
    } else {
      res.status(500).json({ error: '添加失败' });
    }
  }
});

router.delete('/:id', authMiddleware, requireRole('admin'), (req: AuthRequest, res) => {
  const { id } = req.params;
  db.prepare('DELETE FROM libraries WHERE id = ?').run(id);
  res.json({ success: true });
});

export default router;
