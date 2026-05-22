import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import { initDatabase } from './db/schema.js';

initDatabase();

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.listen(config.port, () => {
  console.log(`Server running on http://localhost:${config.port}`);
});
