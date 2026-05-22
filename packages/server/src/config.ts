import path from 'path';
import os from 'os';

const dataDir = process.env.DATA_DIR || path.join(os.homedir(), '.comic-reader');

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  dataDir,
  dbPath: path.join(dataDir, 'database.sqlite'),
  thumbnailsDir: path.join(dataDir, 'thumbnails'),
  jwtSecret: process.env.JWT_SECRET || 'comic-reader-default-secret-change-me',
  adminPassword: process.env.ADMIN_PASSWORD || 'admin123',
};
