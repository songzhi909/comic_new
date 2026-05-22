import { Router } from 'express';
import { authMiddleware, requireRole, AuthRequest } from '../middleware/auth.js';
import db from '../db/database.js';

const router = Router();

router.get('/', authMiddleware, (_req: AuthRequest, res) => {
  const tags = db.prepare('SELECT * FROM tags ORDER BY name').all();
  res.json(tags);
});

router.post('/', authMiddleware, requireRole('admin', 'editor'), (req: AuthRequest, res) => {
  const { name, color } = req.body;
  if (!name) {
    res.status(400).json({ error: '标签名不能为空' });
    return;
  }

  try {
    const result = db.prepare('INSERT INTO tags (name, color) VALUES (?, ?)').run(name, color || '#666666');
    res.json({ id: result.lastInsertRowid, name, color: color || '#666666' });
  } catch (err: any) {
    if (err.message?.includes('UNIQUE')) {
      res.status(400).json({ error: '标签已存在' });
    } else {
      res.status(500).json({ error: '创建失败' });
    }
  }
});

router.put('/:id', authMiddleware, requireRole('admin', 'editor'), (req: AuthRequest, res) => {
  const { id } = req.params;
  const { name, color } = req.body;

  db.prepare('UPDATE tags SET name = COALESCE(?, name), color = COALESCE(?, color) WHERE id = ?')
    .run(name, color, id);

  res.json({ success: true });
});

router.delete('/:id', authMiddleware, requireRole('admin', 'editor'), (req: AuthRequest, res) => {
  const { id } = req.params;
  db.prepare('DELETE FROM tags WHERE id = ?').run(id);
  res.json({ success: true });
});

router.post('/:comicId/tags', authMiddleware, requireRole('admin', 'editor'), (req: AuthRequest, res) => {
  const { comicId } = req.params;
  const { tag_id } = req.body;

  if (!tag_id) {
    res.status(400).json({ error: 'tag_id 不能为空' });
    return;
  }

  try {
    db.prepare('INSERT INTO comic_tags (comic_id, tag_id) VALUES (?, ?)').run(comicId, tag_id);
    res.json({ success: true });
  } catch {
    res.status(400).json({ error: '标签已添加或不存在' });
  }
});

router.delete('/:comicId/tags/:tagId', authMiddleware, requireRole('admin', 'editor'), (req: AuthRequest, res) => {
  const { comicId, tagId } = req.params;
  db.prepare('DELETE FROM comic_tags WHERE comic_id = ? AND tag_id = ?').run(comicId, tagId);
  res.json({ success: true });
});

export default router;
