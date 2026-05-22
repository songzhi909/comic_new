import { Router } from 'express';
import { login, register, changePassword } from '../services/auth.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import db from '../db/database.js';

const router = Router();

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    res.status(400).json({ error: '用户名和密码不能为空' });
    return;
  }

  const result = login(username, password);
  if (!result) {
    res.status(401).json({ error: '用户名或密码错误' });
    return;
  }

  res.json(result);
});

router.post('/register', (req, res) => {
  const { username, password, invite_code } = req.body;
  if (!username || !password || !invite_code) {
    res.status(400).json({ error: '用户名、密码和授权码不能为空' });
    return;
  }

  const result = register(username, password, invite_code);
  if (!result) {
    res.status(400).json({ error: '注册失败，授权码无效或用户名已存在' });
    return;
  }

  res.json(result);
});

router.post('/logout', authMiddleware, (req: AuthRequest, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.slice(7);
    db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
  }
  res.json({ success: true });
});

router.get('/me', authMiddleware, (req: AuthRequest, res) => {
  res.json({ user: req.user });
});

router.post('/change-password', authMiddleware, (req: AuthRequest, res) => {
  const { old_password, new_password } = req.body;
  if (!old_password || !new_password) {
    res.status(400).json({ error: '旧密码和新密码不能为空' });
    return;
  }

  const success = changePassword(req.user!.id, old_password, new_password);
  if (!success) {
    res.status(400).json({ error: '旧密码错误' });
    return;
  }

  res.json({ success: true });
});

export default router;
