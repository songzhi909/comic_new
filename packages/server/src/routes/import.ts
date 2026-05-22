import { Router } from 'express';
import multer from 'multer';
import { authMiddleware, requireRole, AuthRequest } from '../middleware/auth.js';
import { importZip, downloadAndImport } from '../services/importer.js';
import { getTask } from '../services/task-queue.js';

const upload = multer({ dest: 'uploads/' });
const router = Router();

router.post('/upload', authMiddleware, requireRole('admin', 'editor'), upload.single('file'), async (req: AuthRequest, res) => {
  if (!req.file) {
    res.status(400).json({ error: '请上传文件' });
    return;
  }

  const { library_id, title } = req.body;
  if (!library_id) {
    res.status(400).json({ error: '请指定漫画库' });
    return;
  }

  const taskId = importZip(req.file.path, parseInt(library_id, 10), title);
  res.json({ task_id: taskId });
});

router.post('/download', authMiddleware, requireRole('admin', 'editor'), async (req: AuthRequest, res) => {
  const { url, library_id, title } = req.body;
  if (!url || !library_id) {
    res.status(400).json({ error: 'URL 和漫画库不能为空' });
    return;
  }

  const taskId = await downloadAndImport(url, parseInt(library_id, 10), title);
  res.json({ task_id: taskId });
});

router.get('/tasks/:id', authMiddleware, (req: AuthRequest, res) => {
  const task = getTask(req.params.id);
  if (!task) {
    res.status(404).json({ error: '任务不存在' });
    return;
  }
  res.json(task);
});

export default router;
