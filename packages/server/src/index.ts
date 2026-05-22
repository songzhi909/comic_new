import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import { initDatabase } from './db/schema.js';
import { ensureAdminExists } from './services/auth.js';
import authRoutes from './routes/auth.js';

initDatabase();
ensureAdminExists();

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);

app.listen(config.port, () => {
  console.log(`Server running on http://localhost:${config.port}`);
});
