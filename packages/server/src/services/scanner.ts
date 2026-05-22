import fs from 'fs';
import path from 'path';
import db from '../db/database.js';

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp'];

function isImageFile(filename: string): boolean {
  return IMAGE_EXTENSIONS.includes(path.extname(filename).toLowerCase());
}

function getImagesInDir(dirPath: string): string[] {
  return fs.readdirSync(dirPath)
    .filter(f => isImageFile(f))
    .sort();
}

function detectComicType(comicPath: string): { type: 'single' | 'series'; episodes?: string[] } {
  const entries = fs.readdirSync(comicPath, { withFileTypes: true });
  const hasDirectImages = entries.some(e => e.isFile() && isImageFile(e.name));
  const subdirs = entries.filter(e => e.isDirectory());

  if (hasDirectImages) {
    return { type: 'single' };
  }

  if (subdirs.length > 0) {
    const episodeDirs = subdirs
      .map(d => d.name)
      .filter(name => {
        const subPath = path.join(comicPath, name);
        const images = getImagesInDir(subPath);
        return images.length > 0;
      })
      .sort();

    if (episodeDirs.length > 0) {
      return { type: 'series', episodes: episodeDirs };
    }
  }

  return { type: 'single' };
}

export function scanLibrary(libraryId: number): { added: number; updated: number; removed: number } {
  const library = db.prepare('SELECT * FROM libraries WHERE id = ?').get(libraryId) as any;
  if (!library) throw new Error('漫画库不存在');

  const existingComics = db.prepare('SELECT * FROM comics WHERE library_id = ?').all(libraryId) as any[];
  const existingPaths = new Map(existingComics.map(c => [c.path, c]));

  const entries = fs.readdirSync(library.path, { withFileTypes: true });
  const comicDirs = entries.filter(e => e.isDirectory());

  let added = 0;
  let updated = 0;

  const currentPaths = new Set<string>();

  for (const dir of comicDirs) {
    const comicPath = path.join(library.path, dir.name);
    currentPaths.add(comicPath);

    if (existingPaths.has(comicPath)) {
      updated++;
      continue;
    }

    const { type, episodes } = detectComicType(comicPath);

    let pageCount = 0;
    let episodeCount = 0;

    if (type === 'single') {
      pageCount = getImagesInDir(comicPath).length;
    } else if (episodes) {
      episodeCount = episodes.length;
    }

    const result = db.prepare(
      'INSERT INTO comics (library_id, title, path, type, page_count, episode_count) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(libraryId, dir.name, comicPath, type, pageCount, episodeCount);

    if (type === 'series' && episodes) {
      const insertEpisode = db.prepare(
        'INSERT INTO episodes (comic_id, title, path, page_count, sort_order) VALUES (?, ?, ?, ?, ?)'
      );

      for (let i = 0; i < episodes.length; i++) {
        const epPath = path.join(comicPath, episodes[i]);
        const epPageCount = getImagesInDir(epPath).length;
        insertEpisode.run(result.lastInsertRowid, episodes[i], epPath, epPageCount, i);
      }
    }

    added++;
  }

  let removed = 0;
  for (const [comicPath, comic] of existingPaths) {
    if (!currentPaths.has(comicPath)) {
      db.prepare('DELETE FROM comics WHERE id = ?').run((comic as any).id);
      removed++;
    }
  }

  return { added, updated, removed };
}
