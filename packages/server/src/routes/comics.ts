import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import db from '../db/database.js';
import fs from 'fs';
import path from 'path';

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp'];

function getImagesInDir(dirPath: string): string[] {
  return fs.readdirSync(dirPath)
    .filter(f => IMAGE_EXTENSIONS.includes(path.extname(f).toLowerCase()))
    .sort();
}

const router = Router();

router.get('/', authMiddleware, (req: AuthRequest, res) => {
  const { library_id, status, tag, search, page = '1', limit = '20' } = req.query;

  let query = 'SELECT c.* FROM comics c';
  const conditions: string[] = [];
  const params: any[] = [];

  if (library_id) {
    conditions.push('c.library_id = ?');
    params.push(library_id);
  }

  if (status) {
    conditions.push('c.status = ?');
    params.push(status);
  }

  if (search) {
    conditions.push('c.title LIKE ?');
    params.push(`%${search}%`);
  }

  if (tag) {
    query += ' JOIN comic_tags ct ON c.id = ct.comic_id JOIN tags t ON ct.tag_id = t.id';
    conditions.push('t.name = ?');
    params.push(tag);
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  const countQuery = query.replace('SELECT c.*', 'SELECT COUNT(*) as count');
  const total = (db.prepare(countQuery).get(...params) as any).count;

  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);
  query += ' ORDER BY c.created_at DESC LIMIT ? OFFSET ?';
  params.push(limitNum, (pageNum - 1) * limitNum);

  const comics = db.prepare(query).all(...params);
  res.json({ comics, total, page: pageNum, limit: limitNum });
});

router.get('/:id', authMiddleware, (req: AuthRequest, res) => {
  const { id } = req.params;
  const comic = db.prepare('SELECT * FROM comics WHERE id = ?').get(id);
  if (!comic) {
    res.status(404).json({ error: '漫画不存在' });
    return;
  }

  const tags = db.prepare(
    'SELECT t.* FROM tags t JOIN comic_tags ct ON t.id = ct.tag_id WHERE ct.comic_id = ?'
  ).all(id);

  const favorite = db.prepare('SELECT * FROM favorites WHERE comic_id = ?').get(id);

  res.json({ ...(comic as any), tags, favorite });
});

router.get('/:id/pages', authMiddleware, (req: AuthRequest, res) => {
  const { id } = req.params;
  const comic = db.prepare('SELECT * FROM comics WHERE id = ?').get(id) as any;
  if (!comic) {
    res.status(404).json({ error: '漫画不存在' });
    return;
  }

  if (comic.type !== 'single') {
    res.status(400).json({ error: '分集漫画请使用 episodes 接口' });
    return;
  }

  const images = getImagesInDir(comic.path);
  res.json({ pages: images, total: images.length });
});

router.get('/:id/episodes', authMiddleware, (req: AuthRequest, res) => {
  const { id } = req.params;
  const episodes = db.prepare('SELECT * FROM episodes WHERE comic_id = ? ORDER BY sort_order').all(id);
  res.json(episodes);
});

router.get('/:id/episodes/:epId', authMiddleware, (req: AuthRequest, res) => {
  const { epId } = req.params;
  const episode = db.prepare('SELECT * FROM episodes WHERE id = ?').get(epId);
  if (!episode) {
    res.status(404).json({ error: '集数不存在' });
    return;
  }
  res.json(episode);
});

router.get('/:id/episodes/:epId/pages', authMiddleware, (req: AuthRequest, res) => {
  const { epId } = req.params;
  const episode = db.prepare('SELECT * FROM episodes WHERE id = ?').get(epId) as any;
  if (!episode) {
    res.status(404).json({ error: '集数不存在' });
    return;
  }

  const images = getImagesInDir(episode.path);
  res.json({ pages: images, total: images.length });
});

export default router;
