import { Router } from 'express';
import { authMiddleware, requireRole, AuthRequest } from '../middleware/auth.js';
import { scanLibrary } from '../services/scanner.js';

const router = Router();

router.post('/:id/scan', authMiddleware, requireRole('admin'), (req: AuthRequest, res) => {
  const id = req.params.id as string;
  try {
    const result = scanLibrary(parseInt(id, 10));
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
