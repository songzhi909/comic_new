import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config.js';
import { initDatabase } from './db/schema.js';
import { ensureAdminExists } from './services/auth.js';
import authRoutes from './routes/auth.js';
import inviteCodeRoutes from './routes/invite-codes.js';
import libraryRoutes from './routes/libraries.js';
import scanRoutes from './routes/scan.js';
import comicRoutes from './routes/comics.js';
import imageRoutes from './routes/images.js';
import progressRoutes from './routes/progress.js';
import tagRoutes from './routes/tags.js';
import userRoutes from './routes/users.js';
import importRoutes from './routes/import.js';

initDatabase();
ensureAdminExists();

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/invite-codes', inviteCodeRoutes);
app.use('/api/libraries', libraryRoutes);
app.use('/api/libraries', scanRoutes);
app.use('/api/comics', comicRoutes);
app.use('/api/comics', imageRoutes);
app.use('/api/comics', progressRoutes);
app.use('/api/comics', importRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/users', userRoutes);

// 生产模式下服务前端静态文件
if (process.env.NODE_ENV === 'production') {
  const publicDir = path.join(__dirname, 'public');
  app.use(express.static(publicDir));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(publicDir, 'index.html'));
  });
}

app.listen(config.port, () => {
  console.log(`Server running on http://localhost:${config.port}`);
  if (process.env.NODE_ENV === 'production') {
    console.log(`Frontend served from ${path.join(__dirname, 'public')}`);
  }
});
