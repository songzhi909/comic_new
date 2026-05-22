import fs from 'fs';
import path from 'path';
import AdmZip from 'adm-zip';
import db from '../db/database.js';
import { createTask, updateTask, getTask } from './task-queue.js';

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp'];

export function importZip(zipPath: string, libraryId: number, title?: string): string {
  const taskId = createTask();

  setTimeout(async () => {
    try {
      updateTask(taskId, { status: 'running', progress: 10 });

      const library = db.prepare('SELECT * FROM libraries WHERE id = ?').get(libraryId) as any;
      if (!library) throw new Error('漫画库不存在');

      const zip = new AdmZip(zipPath);
      const entries = zip.getEntries();

      const comicTitle = title || path.basename(zipPath, path.extname(zipPath));
      const comicDir = path.join(library.path, comicTitle);
      fs.mkdirSync(comicDir, { recursive: true });

      updateTask(taskId, { progress: 30 });

      const imageEntries = entries.filter(e => {
        const ext = path.extname(e.entryName).toLowerCase();
        return IMAGE_EXTENSIONS.includes(ext) && !e.isDirectory;
      });

      for (let i = 0; i < imageEntries.length; i++) {
        const entry = imageEntries[i];
        const fileName = path.basename(entry.entryName);
        const destPath = path.join(comicDir, fileName);
        fs.writeFileSync(destPath, entry.getData());
        updateTask(taskId, { progress: 30 + Math.floor((i / imageEntries.length) * 50) });
      }

      updateTask(taskId, { progress: 80 });

      const result = db.prepare(
        'INSERT INTO comics (library_id, title, path, type, page_count) VALUES (?, ?, ?, ?, ?)'
      ).run(libraryId, comicTitle, comicDir, 'single', imageEntries.length);

      updateTask(taskId, { status: 'completed', progress: 100, result: { comicId: result.lastInsertRowid } });
    } catch (err: any) {
      updateTask(taskId, { status: 'failed', error: err.message });
    }
  }, 0);

  return taskId;
}

export async function downloadAndImport(url: string, libraryId: number, title?: string): Promise<string> {
  const taskId = createTask();

  setTimeout(async () => {
    try {
      updateTask(taskId, { status: 'running', progress: 5 });

      const response = await fetch(url);
      if (!response.ok) throw new Error(`下载失败: ${response.status}`);

      const buffer = Buffer.from(await response.arrayBuffer());
      const tempPath = path.join(process.env.TEMP || '/tmp', `comic-${Date.now()}.zip`);
      fs.writeFileSync(tempPath, buffer);

      updateTask(taskId, { progress: 30 });

      const importTaskId = importZip(tempPath, libraryId, title);

      const checkImport = setInterval(() => {
        const importTask = getTask(importTaskId);
        if (importTask?.status === 'completed') {
          clearInterval(checkImport);
          updateTask(taskId, { status: 'completed', progress: 100, result: importTask.result });
          try { fs.unlinkSync(tempPath); } catch {}
        } else if (importTask?.status === 'failed') {
          clearInterval(checkImport);
          updateTask(taskId, { status: 'failed', error: importTask.error });
          try { fs.unlinkSync(tempPath); } catch {}
        } else if (importTask) {
          updateTask(taskId, { progress: 30 + Math.floor(importTask.progress * 0.7) });
        }
      }, 500);
    } catch (err: any) {
      updateTask(taskId, { status: 'failed', error: err.message });
    }
  }, 0);

  return taskId;
}
