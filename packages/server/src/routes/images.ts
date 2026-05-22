import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import db from '../db/database.js';
import fs from 'fs';
import path from 'path';
import { getOrGenerateThumbnail, getResizedImage } from '../services/thumbnail.js';

const router = Router();
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp'];

function getImagesInDir(dirPath: string): string[] {
  return fs.readdirSync(dirPath)
    .filter(f => IMAGE_EXTENSIONS.includes(path.extname(f).toLowerCase()))
    .sort();
}

async function serveImage(res: Response, imagePath: string, width?: string) {
  if (!fs.existsSync(imagePath)) {
    res.status(404).json({ error: '图片不存在' });
    return;
  }

  if (width) {
    const buffer = await getResizedImage(imagePath, parseInt(width, 10));
    res.type('jpeg').send(buffer);
  } else {
    res.sendFile(imagePath);
  }
}

router.get('/:id/thumbnail', authMiddleware, async (req: AuthRequest, res) => {
  const { id } = req.params;
  const comic = db.prepare('SELECT * FROM comics WHERE id = ?').get(id) as any;
  if (!comic) {
    res.status(404).json({ error: '漫画不存在' });
    return;
  }

  const images = getImagesInDir(comic.path);
  if (images.length === 0) {
    res.status(404).json({ error: '漫画没有图片' });
    return;
  }

  const thumbPath = path.join(comic.path, images[0]);
  const buffer = await getOrGenerateThumbnail(thumbPath);
  res.type('jpeg').send(buffer);
});

router.get('/:id/pages/:num', authMiddleware, async (req: AuthRequest, res) => {
  const id = req.params.id as string;
  const num = req.params.num as string;
  const width = req.query.width as string | undefined;
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
  const pageIndex = parseInt(num, 10);
  if (pageIndex < 0 || pageIndex >= images.length) {
    res.status(404).json({ error: '页面不存在' });
    return;
  }

  const imagePath = path.join(comic.path, images[pageIndex]);
  await serveImage(res, imagePath, width);
});

router.get('/:id/episodes/:epId/thumbnail', authMiddleware, async (req: AuthRequest, res) => {
  const { epId } = req.params;
  const episode = db.prepare('SELECT * FROM episodes WHERE id = ?').get(epId) as any;
  if (!episode) {
    res.status(404).json({ error: '集数不存在' });
    return;
  }

  const images = getImagesInDir(episode.path);
  if (images.length === 0) {
    res.status(404).json({ error: '集没有图片' });
    return;
  }

  const thumbPath = path.join(episode.path, images[0]);
  const buffer = await getOrGenerateThumbnail(thumbPath);
  res.type('jpeg').send(buffer);
});

router.get('/:id/episodes/:epId/pages/:num', authMiddleware, async (req: AuthRequest, res) => {
  const epId = req.params.epId as string;
  const num = req.params.num as string;
  const width = req.query.width as string | undefined;
  const episode = db.prepare('SELECT * FROM episodes WHERE id = ?').get(epId) as any;
  if (!episode) {
    res.status(404).json({ error: '集数不存在' });
    return;
  }

  const images = getImagesInDir(episode.path);
  const pageIndex = parseInt(num, 10);
  if (pageIndex < 0 || pageIndex >= images.length) {
    res.status(404).json({ error: '页面不存在' });
    return;
  }

  const imagePath = path.join(episode.path, images[pageIndex]);
  await serveImage(res, imagePath, width);
});

export default router;
