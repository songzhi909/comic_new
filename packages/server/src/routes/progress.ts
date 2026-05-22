import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import db from '../db/database.js';

const router = Router();

router.get('/:id/progress', authMiddleware, (req: AuthRequest, res) => {
  const { id } = req.params;
  const progress = db.prepare(
    'SELECT * FROM reading_progress WHERE comic_id = ? AND episode_id IS NULL'
  ).get(id);
  res.json(progress || { current_page: 0, scroll_position: 0, is_completed: 0 });
});

router.put('/:id/progress', authMiddleware, (req: AuthRequest, res) => {
  const { id } = req.params;
  const { current_page, scroll_position, is_completed } = req.body;

  db.prepare(`
    INSERT INTO reading_progress (comic_id, episode_id, current_page, scroll_position, is_completed, updated_at)
    VALUES (?, NULL, ?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(comic_id, episode_id) DO UPDATE SET
      current_page = excluded.current_page,
      scroll_position = excluded.scroll_position,
      is_completed = excluded.is_completed,
      updated_at = CURRENT_TIMESTAMP
  `).run(id, current_page || 0, scroll_position || 0, is_completed ? 1 : 0);

  res.json({ success: true });
});

router.get('/:id/episodes/:epId/progress', authMiddleware, (req: AuthRequest, res) => {
  const { id, epId } = req.params;
  const progress = db.prepare(
    'SELECT * FROM reading_progress WHERE comic_id = ? AND episode_id = ?'
  ).get(id, epId);
  res.json(progress || { current_page: 0, scroll_position: 0, is_completed: 0 });
});

router.put('/:id/episodes/:epId/progress', authMiddleware, (req: AuthRequest, res) => {
  const { id, epId } = req.params;
  const { current_page, scroll_position, is_completed } = req.body;

  db.prepare(`
    INSERT INTO reading_progress (comic_id, episode_id, current_page, scroll_position, is_completed, updated_at)
    VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(comic_id, episode_id) DO UPDATE SET
      current_page = excluded.current_page,
      scroll_position = excluded.scroll_position,
      is_completed = excluded.is_completed,
      updated_at = CURRENT_TIMESTAMP
  `).run(id, epId, current_page || 0, scroll_position || 0, is_completed ? 1 : 0);

  res.json({ success: true });
});

router.put('/:id/favorite', authMiddleware, (req: AuthRequest, res) => {
  const { id } = req.params;

  const existing = db.prepare('SELECT * FROM favorites WHERE comic_id = ?').get(id) as any;
  if (existing) {
    db.prepare('UPDATE favorites SET is_favorite = ?, updated_at = CURRENT_TIMESTAMP WHERE comic_id = ?')
      .run(existing.is_favorite ? 0 : 1, id);
  } else {
    db.prepare('INSERT INTO favorites (comic_id, is_favorite) VALUES (?, 1)').run(id);
  }

  res.json({ success: true });
});

router.put('/:id/rating', authMiddleware, (req: AuthRequest, res) => {
  const { id } = req.params;
  const { rating } = req.body;

  if (rating && (rating < 1 || rating > 5)) {
    res.status(400).json({ error: '评分必须在 1-5 之间' });
    return;
  }

  const existing = db.prepare('SELECT * FROM favorites WHERE comic_id = ?').get(id) as any;
  if (existing) {
    db.prepare('UPDATE favorites SET rating = ?, updated_at = CURRENT_TIMESTAMP WHERE comic_id = ?')
      .run(rating, id);
  } else {
    db.prepare('INSERT INTO favorites (comic_id, rating) VALUES (?, ?)').run(id, rating);
  }

  res.json({ success: true });
});

export default router;
